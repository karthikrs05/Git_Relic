import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'git-relic-auth' });
});

app.use('/api/auth', authRoutes);

app.get('/api/protected/relics', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}`, data: ['private-relic-1', 'private-relic-2'] });
});

app.listen(PORT, () => {
  console.log(`Auth API listening on http://localhost:${PORT}`);
});
