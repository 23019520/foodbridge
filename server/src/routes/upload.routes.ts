import { Router } from 'express';
import { handleImageUpload } from '../controllers/upload.controller';
import { authenticate } from '../middleware/authenticate';
import { uploadImage } from '../middleware/upload';

const router = Router();

// Authenticated users only — upload a single image to Cloudinary
router.post('/image', authenticate, uploadImage.single('image'), handleImageUpload);

export default router;
