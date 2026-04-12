import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export const handleImageUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No image file provided.', 400);

    // Upload the buffer to Cloudinary using a stream
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'foodbridge/products',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error || !result) return reject(error ?? new Error('Upload failed'));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(req.file!.buffer);
      }
    );

    sendSuccess(res, {
      url: result.secure_url,
      public_id: result.public_id,
    }, 201, 'Image uploaded successfully.');
  } catch (error) {
    next(error);
  }
};