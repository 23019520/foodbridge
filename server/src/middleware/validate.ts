import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validates req.body against a Zod schema before the controller runs.
 * If validation fails, Zod throws and the global errorHandler formats the response.
 *
 * Usage:
 *   router.post('/register', validate(RegisterSchema), register)
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    schema.parse(req.body); // throws ZodError on failure — caught by errorHandler
    next();
  };
};
