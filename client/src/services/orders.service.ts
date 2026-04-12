import api from './api';
import { Order, CreateOrderInput, OrderStatus } from '@/types/order.types';

export const placeOrder = async (data: CreateOrderInput): Promise<Order> => {
  const res = await api.post('/orders', data);
  return res.data.data.order;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders/mine');
  return res.data.data.orders;
};

export const getReceivedOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders/received');
  return res.data.data.orders;
};

export const getOrder = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data.data.order;
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data.data.order;
};
