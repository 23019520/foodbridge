import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schemas';

const router = Router();

// Public
router.post('/register', authLimiter, validate(RegisterSchema), register);
router.post('/login', authLimiter, validate(LoginSchema), login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;