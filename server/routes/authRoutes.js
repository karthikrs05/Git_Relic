import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

async function readUsers() {
  const raw = await fs.readFile(usersFile, 'utf-8');
  return JSON.parse(raw);
}

async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const users = await readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = users.find((u) => u.email === normalizedEmail);
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      username: String(username).trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeUsers(users);

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch {
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const users = await readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch {
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export default router;
