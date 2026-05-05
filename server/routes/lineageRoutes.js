import { Router } from 'express';
import Lineage from '../models/Lineage.js';

const router = Router();

// GET /api/lineage/project/:projectId — full lineage chain for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const records = await Lineage.find({ projectId: req.params.projectId })
      .sort({ generationNumber: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lineage' });
  }
});

// GET /api/lineage/:lineageId — single lineage record
router.get('/:lineageId', async (req, res) => {
  try {
    const record = await Lineage.findById(req.params.lineageId);
    if (!record) return res.status(404).json({ message: 'Lineage record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lineage record' });
  }
});

export default router;
