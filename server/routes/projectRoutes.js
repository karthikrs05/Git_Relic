import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "node:url";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { readUsers } from "./authRoutes.js";
import Project from "../models/Project.js";
import SecurityScanLog from "../models/SecurityScanLog.js";
import {
  extractZip,
  validateProjectStructure,
  cleanupTempFile,
  cleanupProjectDir,
  getProjectMetadata,
} from "../utils/fileExtractor.js";
import { parseGitHistory } from "../utils/gitParser.js";
import { scanWithGitleaks, sanitizeIssues } from "../utils/securityScanner.js";
import { analyzeProjectWithAI } from "../utils/aiAnalyzer.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(__dirname, "../../temp"));
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.originalname.endsWith(".zip")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("projectZip"),
  async (req, res) => {
    let tempFilePath = null;
    let projectId = null;

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      tempFilePath = req.file.path;
      const extractId = randomUUID();

      // Extract zip
      const extractionDir = await extractZip(tempFilePath, extractId);

      // Resolve actual project root (handles zips that wrap content in a folder)
      const projectDir = await validateProjectStructure(extractionDir);

      // Parse git history
      const gitData = await parseGitHistory(projectDir);

      // Get metadata
      const metadata = await getProjectMetadata(projectDir);

      // Create project record (initially in pending_scan status)
      const project = new Project({
        donorId: req.user.id,
        currentOwner: req.user.id,
        storageLocation: projectDir,
        commitCount: gitData.commitCount,
        lastActivity: gitData.lastActivity,
        metadata: {
          languages: metadata.languages,
          fileCount: metadata.fileCount,
        },
        status: "pending_scan",
        techStack: metadata.languages,
      });

      await project.save();
      projectId = project._id;

      // Run security scan
      const scanResult = await scanWithGitleaks(projectDir);
      const sanitizedIssues = sanitizeIssues(scanResult.issues);

      // Create security scan log
      const scanLog = new SecurityScanLog({
        projectId: project._id,
        passed: scanResult.passed,
        issueCount: sanitizedIssues.length,
        issues: sanitizedIssues,
        rawOutput: scanResult.rawOutput,
      });

      await scanLog.save();

      // Update project with scan results
      project.securityScanResult = {
        passed: scanResult.passed,
        issues: sanitizedIssues.map(i => `${i.type} in ${i.file}`),
      };

      if (scanResult.skipped) {
        project.status = "published"; // Bypass pending_review
      } else if (scanResult.passed) {
        project.status = "scanned"; // Ready for AI analysis
      } else {
        project.status = "pending_review"; // Blocked due to secrets
      }

      await project.save();

      // Run AI analysis if security scan passed
      if (scanResult.passed) {
        const aiAnalysis = await analyzeProjectWithAI(projectDir, gitData);
        project.aiAnalysis = aiAnalysis;
        project.status = "published";
        project.storageLocation = null; // directory will be deleted below
        await project.save();
        // Clean up extracted project files — all data is now in MongoDB
        await cleanupProjectDir(projectDir);
      }

      // Cleanup temp file
      await cleanupTempFile(tempFilePath);

      const response = {
        message: scanResult.passed
          ? "Project uploaded, scanned, and published successfully"
          : "Project blocked: Security issues detected",
        project: {
          id: project._id,
          status: project.status,
          metadata: project.metadata,
          commitCount: project.commitCount,
          securityScan: {
            passed: scanResult.passed,
            issueCount: sanitizedIssues.length,
            issues: sanitizedIssues,
          },
        },
      };

      // Add AI analysis if available
      if (scanResult.passed && project.aiAnalysis) {
        response.project.aiAnalysis = {
          summary: project.aiAnalysis.summary,
          failureReason: project.aiAnalysis.failureReason,
          roadmap: project.aiAnalysis.roadmap,
          difficulty: project.aiAnalysis.difficulty,
          estimatedHours: project.aiAnalysis.estimatedHours,
        };
      }

      res.status(201).json(response);
    } catch (error) {
      // Cleanup on error
      if (tempFilePath) {
        await cleanupTempFile(tempFilePath);
      }

      // Mark project as failed if created
      if (projectId) {
        await Project.findByIdAndUpdate(projectId, { status: "failed" });
      }

      console.error("Upload error:", error.message);
      res.status(400).json({ message: error.message || "Upload failed" });
    }
  },
);

router.post("/:projectId/analyze", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only donor can trigger analysis
    if (project.donorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Can only analyze scanned projects
    if (project.status !== "scanned") {
      return res.status(400).json({
        message: `Cannot analyze project in ${project.status} status`,
      });
    }

    // Parse git history again
    const gitData = await parseGitHistory(project.storageLocation);

    // Run AI analysis
    const aiAnalysis = await analyzeProjectWithAI(
      project.storageLocation,
      gitData,
    );

    project.aiAnalysis = aiAnalysis;
    project.status = "published";
    await project.save();

    res.json({
      message: "Project analyzed and published successfully",
      project: {
        id: project._id,
        status: project.status,
        aiAnalysis: {
          summary: project.aiAnalysis.summary,
          failureReason: project.aiAnalysis.failureReason,
          roadmap: project.aiAnalysis.roadmap,
          difficulty: project.aiAnalysis.difficulty,
          estimatedHours: project.aiAnalysis.estimatedHours,
        },
      },
    });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({ message: "Failed to analyze project" });
  }
});

router.get("/list", async (_req, res) => {
  try {
    const projects = await Project.find({ status: "published" })
      .select("title description techStack commitCount lastActivity metadata createdAt donorId")
      .lean();

    const users = await readUsers();
    const stitched = projects.map(p => {
      const donor = users.find(u => u.id === p.donorId);
      return { ...p, donorId: { username: donor ? donor.username : "unknown" } };
    });

    res.json(stitched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.get("/:projectId/analysis", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.aiAnalysis) {
      return res.status(404).json({ message: "AI analysis not available" });
    }

    res.json({
      projectId: project._id,
      title: project.title,
      description: project.description,
      aiAnalysis: {
        summary: project.aiAnalysis.summary,
        failureReason: project.aiAnalysis.failureReason,
        roadmap: project.aiAnalysis.roadmap,
        difficulty: project.aiAnalysis.difficulty,
        estimatedHours: project.aiAnalysis.estimatedHours,
        analyzedAt: project.aiAnalysis.analyzedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
});

// Helper: check if the authenticated user is in the ADMIN_EMAILS env var list
function isAdmin(req) {
  if (!process.env.ADMIN_EMAILS) return false;
  const admins = process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
  return admins.includes(req.user?.email?.toLowerCase());
}

// Literal routes must be declared before /:projectId to avoid ambiguity
router.get("/status/pending-review", authMiddleware, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const projects = await Project.find({ status: "pending_review" }).lean();
    const users = await readUsers();
    
    const stitched = projects.map(p => {
      const donor = users.find(u => u.id === p.donorId);
      return { ...p, donorId: { username: donor ? donor.username : "unknown" } };
    });

    res.json(stitched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending reviews" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const users = await readUsers();
    const donor = users.find(u => u.id === project.donorId);
    const owner = users.find(u => u.id === project.currentOwner);

    project.donorId = { username: donor ? donor.username : "unknown" };
    project.currentOwner = { username: owner ? owner.username : "unknown" };

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      currentOwner: req.params.userId,
    }).select("title status createdAt commitCount metadata");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user projects" });
  }
});

router.get("/:projectId/security", async (req, res) => {
  try {
    const scanLog = await SecurityScanLog.findOne({
      projectId: req.params.projectId,
    });

    if (!scanLog) {
      return res.status(404).json({ message: "Security scan not found" });
    }

    res.json(scanLog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch security scan" });
  }
});


export default router;
