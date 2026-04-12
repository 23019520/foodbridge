import { Request, Response, NextFunction } from 'express';
import { findUserByEmail, createUser } from '../models/user.model';
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
    const { findUserById } = await import('../models/user.model');
    const user = await findUserById(req.user!.userId);
    if (!user) throw new AppError('User not found.', 404);
    sendSuccess(res, { user: sanitiseUser(user) });
  } catch (error) {
    next(error);
  }
};
