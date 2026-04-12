import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/users.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/:id', getProfile);                        // Public — view producer profiles
router.patch('/profile', authenticate, updateProfile); // Protected — update own profile

export default router;
