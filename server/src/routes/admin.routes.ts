import { Router } from 'express';
import {
  getPlatformStats,
  getAllUsers,
  setUserStatus,
  getAllListings,
  hardDeleteListing,
  getAllCommissions,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorise } from '../middleware/authorise';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticate, authorise('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', setUserStatus);
router.get('/listings', getAllListings);
router.delete('/listings/:id', hardDeleteListing);
router.get('/commissions', getAllCommissions);

export default router;
