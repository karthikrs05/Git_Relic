import { randomBytes } from 'node:crypto';

// JWT_SECRET is loaded once at module resolution time.
// Importing this module in two places returns the SAME cached export,
// so authRoutes and authMiddleware always share the same secret.
const envSecret = process.env.JWT_SECRET;

if (!envSecret) {
  console.warn(
    '[WARN] JWT_SECRET env var is not set. ' +
    'Using a per-session random secret — all tokens will be invalidated on restart. ' +
    'Set JWT_SECRET in .env before deploying.'
  );
}

export const JWT_SECRET = envSecret || randomBytes(64).toString('hex');
