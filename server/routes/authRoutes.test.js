import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../config/jwtConfig.js', () => ({
  JWT_SECRET: 'test-secret',
}));

// Mock the flat-file storage used by authRoutes
const mockUsers = [];
const mockAccounts = [];

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(async (filePath) => {
      if (filePath.includes('users.json'))    return JSON.stringify(mockUsers);
      if (filePath.includes('accounts.json')) return JSON.stringify(mockAccounts);
      throw Object.assign(new Error('File not found'), { code: 'ENOENT' });
    }),
    writeFile: vi.fn(async (filePath, data) => {
      if (filePath.includes('accounts.json')) {
        mockAccounts.length = 0;
        mockAccounts.push(...JSON.parse(data));
      }
    }),
  },
}));

const MockUser = vi.fn(function(data) {
  Object.assign(this, data);
  this._id = data._id || 'mock-user-id-' + Math.random().toString(36).substring(7);
  this.save = vi.fn(async () => {
    mockUsers.push(this);
    return this;
  });
});
MockUser.findOne = vi.fn(async (query) => mockUsers.find(u => u.email === query.email) || null);
MockUser.findById = vi.fn(async (id) => mockUsers.find(u => u._id === id || u.id === id) || null);

vi.mock('../models/User.js', () => ({ default: MockUser }));

// Dynamic import after mocks
const { default: authRoutes } = await import('../routes/authRoutes.js');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    mockUsers.length = 0;
    mockAccounts.length = 0;
  });

  it('returns 400 when required fields are missing', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('registers a new user and returns a token (201)', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'Password1!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when email already exists', async () => {
    const app = buildApp();
    const payload = { username: 'bob', email: 'bob@example.com', password: 'pass123' };
    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    mockUsers.length = 0;
    mockAccounts.length = 0;
    // Seed a user
    const app = buildApp();
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'carol', email: 'carol@example.com', password: 'Secret99!' });
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(buildApp()).post('/api/auth/login').send({ email: 'carol@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'abc' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token for valid credentials', async () => {
    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'Secret99!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('carol');
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    mockUsers.length = 0;
    mockAccounts.length = 0;
    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({ username: 'dave', email: 'dave@example.com', password: 'Dave1234!' });
    token = res.body.token;
  });

  it('returns 401 without a token', async () => {
    const res = await request(buildApp()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with user profile for valid token', async () => {
    const res = await request(buildApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('dave');
    expect(res.body).not.toHaveProperty('passwordHash');
  });
});

describe('PATCH /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    mockUsers.length = 0;
    mockAccounts.length = 0;
    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({ username: 'eve', email: 'eve@example.com', password: 'Eve1234!' });
    token = res.body.token;
  });

  it('returns 401 without a token', async () => {
    const res = await request(buildApp()).patch('/api/auth/me').send({ bio: 'hello' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when bio is missing from body', async () => {
    const res = await request(buildApp())
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('updates bio and returns updated user', async () => {
    const res = await request(buildApp())
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Open source salvager' });
    expect(res.status).toBe(200);
    // bio is stored on the user object returned
    expect(mockUsers.find((u) => u.username === 'eve')?.bio).toBe('Open source salvager');
  });
});
