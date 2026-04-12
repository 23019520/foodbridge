import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export const handleImageUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No image file provided.', 400);

    // multer-storage-cloudinary attaches the Cloudinary result to req.file
    const file = req.file as Express.Multer.File & { path: string; filename: string };

    sendSuccess(res, {
      url: file.path,         // Cloudinary secure URL
      public_id: file.filename, // Cloudinary public_id (needed if you want to delete later)
    }, 201, 'Image uploaded successfully.');
  } catch (error) {
    next(error);
  }
};
