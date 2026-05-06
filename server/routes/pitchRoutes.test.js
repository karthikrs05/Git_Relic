import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret';

vi.mock('../config/jwtConfig.js', () => ({ JWT_SECRET: TEST_SECRET }));

// ── Mock Mongoose models ──────────────────────────────────────────────────────

const mockPitchSave   = vi.fn();
const mockPitchFindOne = vi.fn();
const mockPitchFind   = vi.fn();
const mockPitchFindById = vi.fn();
const mockPitchUpdateMany = vi.fn();

const mockProjectFindById = vi.fn();
const mockProjectSave = vi.fn();

const MockPitch = vi.fn(function(data) {
  Object.assign(this, data);
  this._id = 'pitch-id-1';
  this.status = data.status || 'pending';
  this.save = mockPitchSave.mockResolvedValue(this);
});
MockPitch.findOne      = mockPitchFindOne;
MockPitch.find         = mockPitchFind;
MockPitch.findById     = mockPitchFindById;
MockPitch.updateMany   = mockPitchUpdateMany;

vi.mock('../models/Pitch.js', () => ({ default: MockPitch }));

const mockProject = {
  _id: 'project-id-1',
  donorId: { toString: () => 'donor-user-id' },
  status: 'published',
  currentOwner: 'donor-user-id',
  save: mockProjectSave.mockResolvedValue(true),
};

vi.mock('../models/Project.js', () => ({
  default: { findById: mockProjectFindById },
}));

vi.mock('../models/Lineage.js', () => ({
  default: vi.fn(function() {
    this.save = vi.fn().mockResolvedValue(this);
  }),
}));

vi.mock('../utils/userUtils.js', () => ({
  populateUser: vi.fn(async (id) => ({ _id: { toString: () => String(id) }, username: 'mockuser' })),
  populateUsers: vi.fn(async (ids) => ids.map(id => ({ _id: { toString: () => String(id) }, username: 'mockuser' }))),
}));

const { default: pitchRoutes } = await import('../routes/pitchRoutes.js');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/pitches', pitchRoutes);
  return app;
}

function makeToken(payload = {}) {
  return jwt.sign({ id: 'salvager-user-id', email: 's@test.com', username: 'sal', ...payload }, TEST_SECRET);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/pitches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjectFindById.mockResolvedValue({ ...mockProject });
    mockPitchFindOne.mockResolvedValue(null); // no existing pitch
  });

  it('returns 401 without auth token', async () => {
    const res = await request(buildApp()).post('/api/pitches').send({ projectId: 'p1', pitchText: 'hello' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when pitchText is missing', async () => {
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ projectId: 'project-id-1' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ pitchText: 'great plan' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when project does not exist', async () => {
    mockProjectFindById.mockResolvedValue(null);
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ projectId: 'nonexistent', pitchText: 'plan' });
    expect(res.status).toBe(404);
  });

  it('returns 403 when donor pitches on own project', async () => {
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken({ id: 'donor-user-id' })}`)
      .send({ projectId: 'project-id-1', pitchText: 'my own project' });
    expect(res.status).toBe(403);
  });

  it('returns 409 when pitch already exists from this user', async () => {
    mockPitchFindOne.mockResolvedValue({ _id: 'existing-pitch' });
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ projectId: 'project-id-1', pitchText: 'duplicate' });
    expect(res.status).toBe(409);
  });

  it('returns 201 for a valid pitch submission', async () => {
    const res = await request(buildApp())
      .post('/api/pitches')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ projectId: 'project-id-1', pitchText: 'I will revive this!' });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/pitches/project/:projectId', () => {
  it('returns an array of pitches', async () => {
    mockPitchFind.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: 'p1', pitchText: 'test', salvagerId: 'salvager-user-id' }]),
    });
    const res = await request(buildApp()).get('/api/pitches/project/project-id-1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/pitches/:pitchId/respond', () => {
  const donorToken = makeToken({ id: 'donor-user-id', email: 'd@test.com' });
  const existingPitch = {
    _id: 'pitch-id-1',
    projectId: 'project-id-1',
    salvagerId: 'salvager-user-id',
    status: 'pending',
    respondedAt: null,
    save: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPitchFindById.mockResolvedValue({ ...existingPitch, save: vi.fn().mockResolvedValue(true) });
    mockProjectFindById.mockResolvedValue({ ...mockProject, save: mockProjectSave });
    mockPitchUpdateMany.mockResolvedValue({ modifiedCount: 0 });
  });

  it('returns 401 without auth', async () => {
    const res = await request(buildApp()).patch('/api/pitches/pitch-id-1/respond').send({ decision: 'accepted' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid decision value', async () => {
    const res = await request(buildApp())
      .patch('/api/pitches/pitch-id-1/respond')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ decision: 'maybe' });
    expect(res.status).toBe(400);
  });

  it('returns 403 when non-donor tries to respond', async () => {
    const res = await request(buildApp())
      .patch('/api/pitches/pitch-id-1/respond')
      .set('Authorization', `Bearer ${makeToken()}`) // salvager, not donor
      .send({ decision: 'accepted' });
    expect(res.status).toBe(403);
  });

  it('returns 200 and triggers salvage on acceptance', async () => {
    const res = await request(buildApp())
      .patch('/api/pitches/pitch-id-1/respond')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ decision: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('accepted');
    // Verify salvage side effects were attempted
    expect(mockPitchUpdateMany).toHaveBeenCalled();
  });

  it('returns 200 and does NOT trigger salvage on rejection', async () => {
    const res = await request(buildApp())
      .patch('/api/pitches/pitch-id-1/respond')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ decision: 'rejected' });
    expect(res.status).toBe(200);
    expect(mockPitchUpdateMany).not.toHaveBeenCalled();
  });

  it('returns 404 when accepting an invalid pitchId', async () => {
    mockPitchFindById.mockResolvedValue(null);
    const res = await request(buildApp())
      .patch('/api/pitches/invalid-id/respond')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ decision: 'accepted' });
    expect(res.status).toBe(404);
  });

  it('returns 404 when rejecting an invalid pitchId', async () => {
    mockPitchFindById.mockResolvedValue(null);
    const res = await request(buildApp())
      .patch('/api/pitches/invalid-id/respond')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ decision: 'rejected' });
    expect(res.status).toBe(404);
  });

  it('returns 403 when non-owner tries to reject', async () => {
    const res = await request(buildApp())
      .patch('/api/pitches/pitch-id-1/respond')
      .set('Authorization', `Bearer ${makeToken()}`) // salvager, not donor
      .send({ decision: 'rejected' });
    expect(res.status).toBe(403);
  });
});
