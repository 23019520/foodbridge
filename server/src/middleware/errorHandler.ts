import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * AppError is our custom error class.
 * Throw this anywhere in the app: throw new AppError('Not found', 404)
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler — registered last in app.ts.
 * Catches all errors thrown from controllers and formats them into
 * consistent JSON responses the frontend can rely on.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Validation errors from Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Our own application errors (expected)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // PostgreSQL unique constraint violation
  if ((err as NodeJS.ErrnoException).code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // Unexpected errors — log full details, return generic message
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again.',
  });
};
