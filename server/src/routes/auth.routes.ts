import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schemas';

const router = Router();

// Public routes — rate limited to prevent brute force
router.post('/register', authLimiter, validate(RegisterSchema), register);
router.post('/login', authLimiter, validate(LoginSchema), login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
