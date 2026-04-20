import { Request, Response, NextFunction } from 'express';
import { createOrUpdateReview, getReviewsByProducer, getExistingReview } from '../models/review.model';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const ReviewSchema = z.object({
  producer_id: z.string().uuid('Invalid producer ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  order_id: z.string().uuid().optional(),
});

export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ReviewSchema.parse(req.body);
    const consumerId = req.user!.userId;

    // Prevent self-review
    if (data.producer_id === consumerId) {
      throw new AppError('You cannot review yourself.', 400);
    }

    const review = await createOrUpdateReview({ consumer_id: consumerId, ...data });
    sendSuccess(res, { review }, 201, 'Review submitted. Thank you!');
  } catch (error) {
    next(error);
  }
};

export const getProducerReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await getReviewsByProducer(id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getMyReviewForProducer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await getExistingReview(req.user!.userId, req.params.producerId);
    sendSuccess(res, { review });
  } catch (error) {
    next(error);
  }
};