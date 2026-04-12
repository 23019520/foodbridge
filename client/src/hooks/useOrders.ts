import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrders,
  getReceivedOrders,
  getOrder,
  placeOrder,
  updateOrderStatus,
} from '@/services/orders.service';
import { CreateOrderInput, OrderStatus } from '@/types/order.types';

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });
};

export const useReceivedOrders = () => {
  return useQuery({
    queryKey: ['received-orders'],
    queryFn: getReceivedOrders,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};
