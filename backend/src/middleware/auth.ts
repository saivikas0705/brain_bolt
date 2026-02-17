import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface RequestWithAuth extends Request {
  userId?: string;
}

export function authMiddleware(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
