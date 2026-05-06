import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../middleware/authMiddleware.js', () => ({
  authMiddleware: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: 'mock-user-id', email: 'test@example.com' };
    next();
  }
}));

vi.mock('../utils/userUtils.js', () => ({
  populateUser: vi.fn().mockResolvedValue({ _id: { toString: () => 'mock-user-id' }, username: 'testuser' }),
  populateUsers: vi.fn().mockResolvedValue([{ _id: { toString: () => 'mock-user-id' }, username: 'testuser' }]),
}));

const mockProjectSave = vi.fn();
const mockProjectFind = vi.fn();
const mockProjectFindById = vi.fn();
const mockProjectAggregate = vi.fn();

const MockProject = vi.fn(function(data) {
  Object.assign(this, data);
  this._id = 'mock-project-id';
  this.save = mockProjectSave.mockResolvedValue(this);
});
MockProject.find = mockProjectFind;
MockProject.findById = mockProjectFindById;
MockProject.aggregate = mockProjectAggregate;

vi.mock('../models/Project.js', () => ({ default: MockProject }));

const MockScanLog = vi.fn(function(data) {
  Object.assign(this, data);
  this.save = vi.fn().mockResolvedValue(this);
});
vi.mock('../models/SecurityScanLog.js', () => ({ default: MockScanLog }));

vi.mock('../utils/fileExtractor.js', () => ({
  extractZip: vi.fn().mockResolvedValue('/tmp/extract-dir'),
  validateProjectStructure: vi.fn().mockResolvedValue('/tmp/extract-dir/project'),
  cleanupTempFile: vi.fn().mockResolvedValue(),
  cleanupProjectDir: vi.fn().mockResolvedValue(),
  getProjectMetadata: vi.fn().mockResolvedValue({ languages: ['JavaScript'], fileCount: 10 }),
}));

vi.mock('../utils/gitParser.js', () => ({
  parseGitHistory: vi.fn().mockResolvedValue({ commitCount: 5, lastActivity: new Date(), commits: [] }),
}));

vi.mock('../utils/securityScanner.js', () => ({
  scanWithGitleaks: vi.fn().mockResolvedValue({ passed: true, issues: [], rawOutput: '' }),
  sanitizeIssues: vi.fn().mockReturnValue([]),
}));

vi.mock('../utils/aiAnalyzer.js', () => ({
  analyzeProjectWithAI: vi.fn().mockResolvedValue({ summary: 'Test', difficulty: 'Beginner', estimatedHours: '10' }),
}));

const { default: projectRoutes } = await import('../routes/projectRoutes.js');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/projects', projectRoutes);
  app.use((err, req, res, next) => {
    res.status(400).json({ message: err.message });
  });
  return app;
}

describe('POST /api/projects/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 + project object when uploading a valid zip', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/projects/upload')
      .set('Authorization', 'Bearer token')
      .attach('projectZip', Buffer.from('fake-zip-data'), 'project.zip');
      
    expect(res.status).toBe(201);
    expect(res.body.project.id).toBe('mock-project-id');
  });

  it('returns 400 when no file is uploaded', async () => {
    const res = await request(buildApp())
      .post('/api/projects/upload')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/No file/i);
  });

  it('returns 401 when auth token is missing', async () => {
    const res = await request(buildApp())
      .post('/api/projects/upload')
      .attach('projectZip', Buffer.from('fake'), 'project.zip');
    expect(res.status).toBe(401);
  });

  it('returns 400 when uploading an invalid file type', async () => {
    const res = await request(buildApp())
      .post('/api/projects/upload')
      .set('Authorization', 'Bearer token')
      .attach('projectZip', Buffer.from('fake-txt'), 'project.txt');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only ZIP/i);
  });
  
  it('returns 400 if validation fails without .git', async () => {
    const { validateProjectStructure } = await import('../utils/fileExtractor.js');
    validateProjectStructure.mockRejectedValueOnce(new Error('Missing .git directory'));
    
    const res = await request(buildApp())
      .post('/api/projects/upload')
      .set('Authorization', 'Bearer token')
      .attach('projectZip', Buffer.from('fake-zip'), 'project.zip');
      
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing .git directory/i);
  });
});

describe('GET /api/projects/list', () => {
  it('returns array of published projects', async () => {
    mockProjectFind.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: 'p1', title: 'Test', donorId: 'mock-user-id' }]),
    });
    const res = await request(buildApp()).get('/api/projects/list');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].donorId.username).toBe('testuser');
  });

  it('returns empty array when database is empty', async () => {
    mockProjectFind.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    });
    const res = await request(buildApp()).get('/api/projects/list');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/projects/:projectId', () => {
  it('returns project object for valid project ID', async () => {
    mockProjectFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: 'p1', title: 'Test', donorId: 'u1', currentOwner: 'u2' }),
    });
    const res = await request(buildApp()).get('/api/projects/p1');
    expect(res.status).toBe(200);
    expect(res.body._id).toBe('p1');
  });

  it('returns 404 for invalid/nonexistent ID', async () => {
    mockProjectFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    const res = await request(buildApp()).get('/api/projects/notfound');
    expect(res.status).toBe(404);
  });

  it('returns 500/400 for malformed ObjectId', async () => {
    mockProjectFindById.mockImplementation(() => {
      throw new Error('CastError');
    });
    const res = await request(buildApp()).get('/api/projects/malformed');
    expect(res.status).toBe(500); 
  });
});

describe('GET /api/projects/user/:userId', () => {
  it('returns projects for authenticated user', async () => {
    mockProjectFind.mockReturnValue({
      select: vi.fn().mockResolvedValue([{ _id: 'p1', title: 'Test' }]),
    });
    const res = await request(buildApp())
      .get('/api/projects/user/mock-user-id')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('returns empty array when user has no projects', async () => {
    mockProjectFind.mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });
    const res = await request(buildApp())
      .get('/api/projects/user/mock-user-id')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 401 when auth token is missing', async () => {
    const res = await request(buildApp()).get('/api/projects/user/mock-user-id');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/projects/status/pending-review', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = '';
  });

  it('returns 403 or 401 based on admin check', async () => {
    const res = await request(buildApp())
      .get('/api/projects/status/pending-review')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(403);
  });

  it('returns array for authenticated admin request', async () => {
    process.env.ADMIN_EMAILS = 'test@example.com';
    mockProjectFind.mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ _id: 'p1', title: 'Test', donorId: 'mock-user-id' }]),
    });
    const res = await request(buildApp())
      .get('/api/projects/status/pending-review')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockProjectFindById).not.toHaveBeenCalledWith('status');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(buildApp()).get('/api/projects/status/pending-review');
    expect(res.status).toBe(401);
  });
});
