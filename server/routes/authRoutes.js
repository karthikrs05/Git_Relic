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
const accountsFile = path.join(__dirname, '..', 'data', 'accounts.json');

async function readUsers() {
  const raw = await fs.readFile(usersFile, 'utf-8');
  return JSON.parse(raw);
}

async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

async function readAccounts() {
  try {
    const raw = await fs.readFile(accountsFile, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAccounts(accounts) {
  await fs.writeFile(accountsFile, JSON.stringify(accounts, null, 2));
}

function createAccount(user, overrides = {}) {
  const now = new Date().toISOString();
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt || now,
    lastLoginAt: now,
    stats: {
      relicPoints: 0,
      droppedProjects: 0,
      salvagedProjects: 0,
      activePitches: 0,
      ...overrides.stats,
    },
    activity: overrides.activity || [
      { at: now, type: 'account_created', message: 'Account provisioned and ready.' },
    ],
  };
}

function publicUser(user, account) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    account,
  };
}

async function upsertAccountForUser(user, overrides = {}) {
  const accounts = await readAccounts();
  const existingIndex = accounts.findIndex((account) => account.userId === user.id);
  const nextAccount = existingIndex === -1
    ? createAccount(user, overrides)
    : {
        ...accounts[existingIndex],
        username: user.username,
        email: user.email,
        createdAt: accounts[existingIndex].createdAt || user.createdAt,
        lastLoginAt: new Date().toISOString(),
        stats: {
          relicPoints: 0,
          droppedProjects: 0,
          salvagedProjects: 0,
          activePitches: 0,
          ...accounts[existingIndex].stats,
          ...overrides.stats,
        },
        activity: [
          ...(accounts[existingIndex].activity || []),
          ...(overrides.activity || []),
        ],
      };

  if (existingIndex === -1) {
    accounts.push(nextAccount);
  } else {
    accounts[existingIndex] = nextAccount;
  }

  await writeAccounts(accounts);
  return nextAccount;
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

    const account = await upsertAccountForUser(user);

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user, account) });
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

    const account = await upsertAccountForUser(user, {
      activity: [
        { at: new Date().toISOString(), type: 'login', message: 'Authenticated via backend session.' },
      ],
    });
    const token = signToken(user);
    return res.json({ token, user: publicUser(user, account) });
  } catch {
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const account = await upsertAccountForUser(user);
    return res.json(publicUser(user, account));
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export default router;
