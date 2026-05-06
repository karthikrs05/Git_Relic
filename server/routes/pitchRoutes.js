import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Pitch from '../models/Pitch.js';
import Project from '../models/Project.js';
import Lineage from '../models/Lineage.js';
import { populateUser, populateUsers } from '../utils/userUtils.js';
const router = Router();

// POST /api/pitches — submit a pitch (salvagers only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, pitchText, prLink } = req.body;
    if (!projectId || !pitchText) {
      return res.status(400).json({ message: 'projectId and pitchText are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'published') {
      return res.status(400).json({ message: 'Can only pitch on published projects' });
    }
    if (project.donorId.toString() === req.user.id) {
      return res.status(403).json({ message: 'Donors cannot pitch on their own projects' });
    }

    const existing = await Pitch.findOne({ projectId, salvagerId: req.user.id });
    if (existing) return res.status(409).json({ message: 'You already submitted a pitch for this project' });

    const pitch = new Pitch({ projectId, salvagerId: req.user.id, pitchText, prLink });
    await pitch.save();
    res.status(201).json(pitch);
  } catch (error) {
    console.error('Pitch submit error:', error.message);
    res.status(500).json({ message: 'Failed to submit pitch' });
  }
});

// GET /api/pitches/project/:projectId — list pitches for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const pitches = await Pitch.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .lean();
    
    const salvagerIds = pitches.map(p => p.salvagerId);
    const users = await populateUsers(salvagerIds);
    const stitched = pitches.map(p => {
      const salvager = users.find(u => u._id.toString() === p.salvagerId);
      return { ...p, salvagerId: { username: salvager ? salvager.username : 'unknown' } };
    });

    res.json(stitched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pitches' });
  }
});

// GET /api/pitches/user/my — list pitches submitted by the current user
router.get('/user/my', authMiddleware, async (req, res) => {
  try {
    const pitches = await Pitch.find({ salvagerId: req.user.id })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });
    res.json(pitches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your pitches' });
  }
});

// GET /api/pitches/donor/incoming — list pending pitches for projects dropped by current user
router.get('/donor/incoming', authMiddleware, async (req, res) => {
  try {
    const myProjects = await Project.find({ donorId: req.user.id }).select('_id').lean();
    const myProjectIds = myProjects.map((p) => p._id);
    if (myProjectIds.length === 0) return res.json([]);

    const incoming = await Pitch.find({ projectId: { $in: myProjectIds }, status: 'pending' })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 })
      .lean();

    const salvagerIds = incoming.map((p) => p.salvagerId);
    const users = await populateUsers(salvagerIds);

    const salvageCounts = await Project.aggregate([
      { $match: { status: 'salvaged', currentOwner: { $in: salvagerIds } } },
      { $group: { _id: '$currentOwner', salvaged: { $sum: 1 } } },
    ]);

    const salvagedByUser = new Map(salvageCounts.map((e) => [String(e._id), e.salvaged]));

    const stitched = incoming.map((p) => {
      const salvager = users.find((u) => u._id.toString() === String(p.salvagerId));
      return {
        ...p,
        salvagerId: {
          id: p.salvagerId,
          username: salvager ? salvager.username : 'unknown',
          salvagedProjects: salvagedByUser.get(String(p.salvagerId)) || 0,
        },
      };
    });

    res.json(stitched);
  } catch (error) {
    console.error('Incoming pitches error:', error.message);
    res.status(500).json({ message: 'Failed to fetch incoming pitches' });
  }
});

// GET /api/pitches/:pitchId — single pitch
router.get('/:pitchId', async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.pitchId).lean();
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });

    const salvager = await populateUser(pitch.salvagerId);
    pitch.salvagerId = { username: salvager ? salvager.username : 'unknown' };

    res.json(pitch);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pitch' });
  }
});

// PATCH /api/pitches/:pitchId/respond — accept or reject (donor only)
// Accepting triggers salvage: ownership transferred, lineage created, others rejected.
router.patch('/:pitchId/respond', authMiddleware, async (req, res) => {
  try {
    const { decision } = req.body;
    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be "accepted" or "rejected"' });
    }

    const pitch = await Pitch.findById(req.params.pitchId);
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });

    const project = await Project.findById(pitch.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.donorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project donor can respond to pitches' });
    }

    pitch.status = decision;
    pitch.respondedAt = new Date();
    await pitch.save();

    if (decision === 'accepted') {
      // Transfer ownership and mark project as salvaged
      project.currentOwner = pitch.salvagerId;
      project.status = 'salvaged';
      await project.save();

      // Create lineage record
      await new Lineage({
        projectId:    project._id,
        donorId:      project.donorId,
        salvagerId:   pitch.salvagerId,
        transferredAt: new Date(),
      }).save();

      // Reject all other pending pitches for this project
      await Pitch.updateMany(
        { projectId: project._id, _id: { $ne: pitch._id }, status: 'pending' },
        { status: 'rejected', respondedAt: new Date() }
      );
    }

    res.json({ message: `Pitch ${decision}`, pitch, project: { status: project.status, currentOwner: project.currentOwner } });
  } catch (error) {
    console.error('Pitch respond error:', error.message);
    res.status(500).json({ message: 'Failed to respond to pitch' });
  }
});

export default router;
