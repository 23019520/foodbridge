import multer from 'multer';
import { AppError } from './errorHandler';

/**
 * Multer middleware using memory storage.
 * Files are held in RAM as a Buffer — never written to disk.
 * The upload controller then pushes the buffer to Cloudinary.
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
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