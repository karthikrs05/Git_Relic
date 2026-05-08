import { Router } from 'express';
import Project from '../models/Project.js';
import Pitch from '../models/Pitch.js';
import Lineage from '../models/Lineage.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { populateUsers } from '../utils/userUtils.js';

const router = Router();

function toActivityItem({ at, type, message, projectId }) {
  return { at, type, message, projectId };
}

// GET /api/insights/overview — public platform insights for Landing
router.get('/overview', async (_req, res) => {
  try {
    const [
      totalRelicsUploaded,
      activeRevivalRequests,
      revivedProjects,
      recentProjects,
      recentPitches,
      recentDecisions,
    ] = await Promise.all([
      Project.countDocuments({ status: { $ne: 'failed' } }),
      Pitch.countDocuments({ status: 'pending' }),
      Project.countDocuments({ status: 'salvaged' }),
      Project.find({ status: { $ne: 'failed' } })
        .select('_id title status createdAt donorId')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Pitch.find({})
        .select('_id projectId salvagerId status createdAt')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Pitch.find({ status: { $in: ['accepted', 'rejected'] }, respondedAt: { $exists: true } })
        .select('_id projectId salvagerId status respondedAt')
        .sort({ respondedAt: -1 })
        .limit(12)
        .lean(),
    ]);

    const donorIds = recentProjects.map((p) => p.donorId);
    const pitchUserIds = [...recentPitches, ...recentDecisions].map((p) => p.salvagerId);
    const users = await populateUsers([...new Set([...donorIds, ...pitchUserIds].map(String))]);

    const usernameFor = (id) => {
      const u = users.find((x) => x._id.toString() === String(id));
      return u ? u.username : 'unknown';
    };

    const projectTitleFor = (projectId) => {
      const proj = recentProjects.find((p) => p._id.toString() === String(projectId));
      return proj?.title || 'untitled';
    };

    const activity = [
      ...recentProjects.map((p) =>
        toActivityItem({
          at: p.createdAt,
          type: 'relic_uploaded',
          projectId: p._id,
          message: `${usernameFor(p.donorId)} dropped "${p.title || 'untitled'}"`,
        }),
      ),
      ...recentPitches.map((p) =>
        toActivityItem({
          at: p.createdAt,
          type: 'revival_request_sent',
          projectId: p.projectId,
          message: `${usernameFor(p.salvagerId)} sent a revival request for "${projectTitleFor(p.projectId)}"`,
        }),
      ),
      ...recentDecisions.map((p) =>
        toActivityItem({
          at: p.respondedAt,
          type: p.status === 'accepted' ? 'revival_request_accepted' : 'revival_request_rejected',
          projectId: p.projectId,
          message: `${usernameFor(p.salvagerId)} was ${p.status} for "${projectTitleFor(p.projectId)}"`,
        }),
      ),
    ]
      .filter((x) => x.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 12);

    const featuredRelicsRaw = await Project.find({ status: 'published' })
      .select('title description techStack commitCount lastActivity metadata createdAt donorId status')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const featuredDonorIds = featuredRelicsRaw.map((p) => p.donorId);
    const featuredUsers = await populateUsers(featuredDonorIds);
    const featuredRelics = featuredRelicsRaw.map((p) => {
      const donor = featuredUsers.find((u) => u._id.toString() === p.donorId.toString());
      return { ...p, donorId: { username: donor ? donor.username : 'unknown' } };
    });

    res.json({
      totals: {
        totalRelicsUploaded,
        activeRevivalRequests,
        revivedProjects,
        totalRevivalTransfers: await Lineage.countDocuments({}),
      },
      activity,
      featuredRelics,
    });
  } catch (error) {
    console.error('Insights overview error:', error.message);
    res.status(500).json({ message: 'Failed to fetch platform insights' });
  }
});

// GET /api/insights/me — authenticated user insights for dashboard
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [droppedCount, salvagedCount, submittedPendingCount, incomingPendingCount] = await Promise.all([
      Project.countDocuments({ donorId: userId, status: { $ne: 'failed' } }),
      Project.countDocuments({ currentOwner: userId, status: 'salvaged' }),
      Pitch.countDocuments({ salvagerId: userId, status: 'pending' }),
      (async () => {
        const projectIds = await Project.find({ donorId: userId })
          .select('_id')
          .lean();
        const ids = projectIds.map((p) => p._id);
        if (ids.length === 0) return 0;
        return Pitch.countDocuments({ projectId: { $in: ids }, status: 'pending' });
      })(),
    ]);

    // Deterministic, DB-derived reputation (no placeholder random values).
    const reputationPoints = salvagedCount * 100 + droppedCount * 10;

    res.json({
      droppedCount,
      salvagedCount,
      submittedPendingCount,
      incomingPendingCount,
      reputationPoints,
    });
  } catch (error) {
    console.error('Insights me error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user insights' });
  }
});

export default router;

