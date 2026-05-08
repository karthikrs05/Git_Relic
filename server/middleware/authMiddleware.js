import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtConfig.js';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;

    // Prefer explicit id claim, but fall back to email to support older/dev tokens.
    if (decoded?.id) {
      user = await User.findById(decoded.id).catch(() => null);
    }
    if (!user && decoded?.email) {
      user = await User.findOne({ email: String(decoded.email).trim().toLowerCase() }).catch(() => null);
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found for provided token' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      token: decoded,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
