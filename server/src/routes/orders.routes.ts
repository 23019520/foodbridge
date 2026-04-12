import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  getOrder,
  changeOrderStatus,
} from '../controllers/orders.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorise } from '../middleware/authorise';
import { CreateOrderSchema, UpdateOrderStatusSchema } from '../schemas/order.schemas';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post('/', authorise('consumer'), validate(CreateOrderSchema), createOrder);
router.get('/mine', authorise('consumer'), getMyOrders);
router.get('/received', authorise('producer'), getReceivedOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', authorise('producer', 'admin'), validate(UpdateOrderStatusSchema), changeOrderStatus);

export default router;
