import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/user.model';
import { query } from '../config/db'; // ✅ FIX: make sure this exists
import { logger } from '../utils/logger'; // ✅ FIX: add logger

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

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('strict' as const),
};

// 🔐 Use separate secret for reset tokens (IMPORTANT)
const RESET_TOKEN_SECRET = env.JWT_RESET_SECRET || env.JWT_ACCESS_SECRET;

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    const user = await findUserByEmail(email);

    if (user) {
      // ✅ FIX: short-lived reset token (10–15 min)
      const token = jwt.sign(
        { userId: user.id },
        RESET_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

      // TODO: send email
      logger.info(`Password reset link for ${email}: ${resetUrl}`);
    }

    sendSuccess(res, null, 200, 'If an account exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required.', 400);
    }

    // ✅ FIX: verify reset token (not access token)
    const decoded = jwt.verify(token, RESET_TOKEN_SECRET) as JwtPayload;

    if (!decoded.userId) {
      throw new AppError('Invalid token.', 400);
    }

    const hashedPassword = await hashPassword(password);

    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.userId]
    );

    sendSuccess(res, null, 200, 'Password updated successfully.');
  } catch (error) {
    next(new AppError('Invalid or expired token.', 400));
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, phone, area, business_name, bio } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) throw new AppError('Email already exists.', 409);

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      area,
      business_name,
      bio,
    });

    const payload = { userId: user.id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user: sanitiseUser(user) }, 201, 'Account created!');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) throw new AppError('Invalid email or password.', 401);

    const match = await comparePassword(password, user.password);
    if (!match) throw new AppError('Invalid email or password.', 401);

    const payload = { userId: user.id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user: sanitiseUser(user) }, 200, 'Welcome back!');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  sendSuccess(res, null, 200, 'Logged out.');
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { findUserById } = await import('../models/user.model');

    const user = await findUserById(req.user!.userId);
    if (!user) throw new AppError('User not found.', 404);

    sendSuccess(res, { user: sanitiseUser(user) });
  } catch (error) {
    next(error);
  }
};