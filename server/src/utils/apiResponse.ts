import { Response } from 'express';

/**
 * Standardised API response helpers.
 * Every endpoint uses these so the frontend always gets a consistent shape:
 * { success: true/false, data?: any, message?: string, errors?: any[] }
 */

export const sendSuccess = (res: Response, data: unknown, statusCode = 200, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
