import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import pitchRoutes from './routes/pitchRoutes.js';
import lineageRoutes from './routes/lineageRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import { connectDB } from './config/db.js';


const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend is running' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'git-relic-api' });
});

app.get('/api', (_req, res) => {
  res.json({ status: 'ok', service: 'git-relic-api', message: 'API root is accessible' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pitches', pitchRoutes);
app.use('/api/lineage', lineageRoutes);
app.use('/api/insights', insightRoutes);

// Connect to MongoDB and start server
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Git Relic API listening on http://localhost:${PORT}`);
  });
})();
