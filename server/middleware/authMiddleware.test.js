import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock the jwtConfig so we control the secret in tests
vi.mock('../config/jwtConfig.js', () => ({
  JWT_SECRET: 'test-secret-for-unit-tests',
}));

import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware.js';

const TEST_SECRET = 'test-secret-for-unit-tests';

function makeReqRes(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('authMiddleware', () => {
  it('calls next() and sets req.user for a valid token', () => {
    const token = jwt.sign({ id: 'user1', email: 'a@b.com', username: 'alice' }, TEST_SECRET);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ id: 'user1', email: 'a@b.com' });
  });

  it('returns 401 when Authorization header is missing', () => {
    const { req, res, next } = makeReqRes(undefined);
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with "Bearer "', () => {
    const { req, res, next } = makeReqRes('Basic abc123');
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an expired token', () => {
    const token = jwt.sign({ id: 'u1' }, TEST_SECRET, { expiresIn: '-1s' });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for a token signed with the wrong secret', () => {
    const token = jwt.sign({ id: 'u1' }, 'wrong-secret');
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for a malformed token string', () => {
    const { req, res, next } = makeReqRes('Bearer not.a.real.token');
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
