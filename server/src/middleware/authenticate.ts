import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface JwtPayload {
  userId: string;
  role: 'consumer' | 'producer' | 'admin';
}

/**
 * Verifies the JWT access token from the HTTP-only cookie.
 * On success, attaches the decoded payload to req.user.
 * Any protected route must have this middleware before its controller.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }
};
