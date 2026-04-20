import { Router } from 'express';
import { submitReview, getProducerReviews, getMyReviewForProducer } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/authenticate';
import { authorise } from '../middleware/authorise';

const router = Router();

router.get('/producer/:id', getProducerReviews);                                          // Public
router.get('/my/:producerId', authenticate, getMyReviewForProducer);                      // Consumer
router.post('/', authenticate, authorise('consumer'), submitReview);                       // Consumer only

export default router;