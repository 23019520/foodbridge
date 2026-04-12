import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { AppError } from './errorHandler';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // @ts-expect-error — params typing is loose in multer-storage-cloudinary
    folder: 'foodbridge/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

/**
 * Multer middleware configured to upload directly to Cloudinary.
 * Max file size: 5MB. Max 5 images per listing.
 *
 * Usage on a route:
 *   router.post('/upload/image', authenticate, uploadImage.single('image'), handleUpload)
 */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are allowed.', 400));
    }
  },
});
