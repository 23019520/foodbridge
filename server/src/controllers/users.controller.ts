import { Request, Response, NextFunction } from 'express';
import { getPublicProfile, updateUser } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getPublicProfile(req.params.id);
    if (!profile) throw new AppError('User not found.', 404);
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateUser(req.user!.userId, req.body);
    if (!updated) throw new AppError('User not found.', 404);
    const { password: _p, ...safe } = updated;
    sendSuccess(res, { user: safe }, 200, 'Profile updated.');
  } catch (error) {
    next(error);
  }
};
