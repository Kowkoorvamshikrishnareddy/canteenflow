import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/index.js';
import { env } from '../config/env.js';
import { Profile, UserRole } from '../shared/types.js';

export interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const userHeaderId = req.headers['x-user-id'] as string;

  let userId: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { sub?: string; id?: string };
        userId = decoded.sub || decoded.id;
      } catch (err) {
        // In non-production, check if token directly matches a seeded demo profile ID
        if (env.NODE_ENV !== 'production' && db.profiles.has(token)) {
          userId = token;
        }
      }
    }
  } else if (userHeaderId && env.NODE_ENV !== 'production') {
    // Only permit x-user-id header in development/test
    userId = userHeaderId;
  }

  // If user found in database
  if (userId && db.profiles.has(userId)) {
    req.user = db.profiles.get(userId);
    return next();
  }

  // Fallback to default student in development/test mode for rapid prototyping
  if (env.NODE_ENV !== 'production') {
    const defaultUser = db.profiles.get('55555555-5555-5555-5555-555555555555');
    if (defaultUser) {
      req.user = defaultUser;
    }
  }

  next();
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required to access this resource.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Your account role (${req.user.role}) is not authorized for this action. Required: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
}
