import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; role: Role; email: string };
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
