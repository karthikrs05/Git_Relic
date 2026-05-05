import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads/projects');
const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure runtime directories exist at startup
try {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
} catch (error) {
  console.error('[FATAL] Cannot create upload directories:', error.message);
  process.exit(1);
}

export async function extractZip(zipPath, extractId) {
  try {
    const projectDir = path.join(UPLOAD_DIR, extractId);
    await fs.mkdir(projectDir, { recursive: true });

    return new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(Extract({ path: projectDir }))
        .on('close', () => {
          resolve(projectDir);
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Extraction error:', error.message);
    throw error;
  }
}

export async function validateProjectStructure(extractionDir) {
  // Helper: check if a given dir has a .git subdirectory
  async function hasGit(dir) {
    try {
      const stats = await fs.stat(path.join(dir, '.git'));
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Case 1: .git is directly in the extraction root (ideal structure)
  if (await hasGit(extractionDir)) return extractionDir;

  // Case 2: zip wrapped the project in a single top-level folder
  // e.g. my-project/ → my-project/.git/  (common with Windows right-click zip)
  const entries = await fs.readdir(extractionDir, { withFileTypes: true });
  const subDirs = entries.filter((e) => e.isDirectory());

  for (const sub of subDirs) {
    const candidate = path.join(extractionDir, sub.name);
    if (await hasGit(candidate)) return candidate;
  }

  throw new Error('Invalid project structure: no .git directory found at root or one level deep. Make sure the zip contains a Git repository.');
}

export async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

export async function cleanupProjectDir(projectDir) {
  try {
    await fs.rm(projectDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Project dir cleanup error:', error.message);
  }
}

export async function getProjectMetadata(projectDir) {
  try {
    const files = await fs.readdir(projectDir, { recursive: true });
    const fileCount = files.length;

    // Detect languages based on file extensions
    const extensions = new Set();
    for (const file of files) {
      if (typeof file === 'string') {
        const ext = path.extname(file);
        if (ext) extensions.add(ext);
      }
    }

    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'JSX',
      '.tsx': 'TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
    };

    const languages = Array.from(extensions)
      .filter(ext => languageMap[ext])
      .map(ext => languageMap[ext]);

    return {
      languages: [...new Set(languages)],
      fileCount,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error.message);
    return { languages: [], fileCount: 0 };
  }
}
