import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Role-based access control middleware.
 * Use after authenticate() to restrict a route to specific roles.
 *
 * Usage:
 *   router.post('/listings', authenticate, authorise('producer', 'admin'), createListing)
 *   router.get('/admin/stats', authenticate, authorise('admin'), getStats)
 */
export const authorise = (...roles: Array<'consumer' | 'producer' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. This action requires one of: ${roles.join(', ')}.`,
        403
      );
    }

    next();
  };
};
