import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'git-relic-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/protected/relics', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.id}`, data: ['private-relic-1', 'private-relic-2'] });
});

// Connect to MongoDB and start server
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Git Relic API listening on http://localhost:${PORT}`);
  });
})();
