import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schemas';

const router = Router();

router.post('/register', authLimiter, validate(RegisterSchema), register);
router.post('/login', authLimiter, validate(LoginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;