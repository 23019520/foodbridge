import { Request, Response, NextFunction } from 'express';
import { findOrderById, findOrdersByConsumer, findOrdersByProducer, updateOrderStatus } from '../models/order.model';
import { placeOrder, completeOrder } from '../services/orders.service';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await placeOrder(req.user!.userId, req.body);
    sendSuccess(res, { order }, 201, 'Order placed successfully!');
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await findOrdersByConsumer(req.user!.userId);
    sendSuccess(res, { orders });
  } catch (error) {
    next(error);
  }
};

export const getReceivedOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await findOrdersByProducer(req.user!.userId);
    sendSuccess(res, { orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await findOrderById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    // Users can only see their own orders
    const userId = req.user!.userId;
    const isOwner = order.consumer_id === userId || order.producer_id === userId;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Access denied.', 403);

    sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
};

export const changeOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (status === 'completed') {
      const order = await completeOrder(id, req.user!.userId);
      return sendSuccess(res, { order }, 200, 'Order marked as completed. Commission recorded.');
    }

    const order = await updateOrderStatus(id, status);
    if (!order) throw new AppError('Order not found.', 404);
    sendSuccess(res, { order }, 200, `Order status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
};
