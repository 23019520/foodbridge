import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser } from '../models/user.model';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  sanitiseUser,
} from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { env } from '../config/env';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';
import { JwtPayload } from '../middleware/authenticate';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, phone, area, business_name, bio } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) throw new AppError('An account with this email already exists.', 409);

    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, password: hashedPassword, role, phone, area, business_name, bio });

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name, user.role);

    sendSuccess(res, { user: sanitiseUser(user) }, 201, 'Account created successfully!');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) throw new AppError('No account found with this email address.', 401);

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new AppError('Incorrect password. Please try again.', 401);

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    sendSuccess(res, { user: sanitiseUser(user) }, 200, 'Welcome back!');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  sendSuccess(res, null, 200, 'Logged out successfully.');
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserById(req.user!.userId);
    if (!user) throw new AppError('User not found.', 404);
    sendSuccess(res, { user: sanitiseUser(user) });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    const user = await findUserByEmail(email);
    if (user) {
      // Sign a dedicated reset token — 1 hour expiry, separate secret
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password_reset' },
        env.JWT_ACCESS_SECRET + user.password, // Include hashed password so token is one-time use
        { expiresIn: '1h' }
      );

      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
      sendPasswordResetEmail(user.email, user.name, resetUrl);
      logger.info(`Reset link for ${email}: ${resetUrl}`);
    }

    sendSuccess(res, null, 200, 'If an account with that email exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw new AppError('Token and password are required.', 400);
    if (password.length < 8) throw new AppError('Password must be at least 8 characters.', 400);

    // Decode without verifying first to get the userId
    const decoded = jwt.decode(token) as { userId?: string; purpose?: string };
    if (!decoded?.userId || decoded?.purpose !== 'password_reset') {
      throw new AppError('Invalid reset link. Please request a new one.', 400);
    }

    // Fetch the user to get their current password hash (used as part of secret)
    const user = await findUserById(decoded.userId);
    if (!user) throw new AppError('User not found.', 404);

    // Now verify with the full secret (current password hash included)
    jwt.verify(token, env.JWT_ACCESS_SECRET + user.password);

    // Update password
    const hashedPassword = await hashPassword(password);
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, user.id]
    );

    sendSuccess(res, null, 200, 'Password updated successfully. You can now log in.');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Reset link has expired. Please request a new one.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid reset link. Please request a new one.', 400));
    }
    next(error);
  }
};
