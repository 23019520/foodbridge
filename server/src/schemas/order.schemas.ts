import { z } from 'zod';

const OrderItemSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  quantity: z.number().int().positive().default(1),
});

export const CreateOrderSchema = z.object({
  producer_id: z.string().uuid('Invalid producer ID'),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  delivery_type: z.enum(['delivery', 'collection']),
  delivery_address: z.string().optional(),
  consumer_note: z.string().max(500).optional(),
  contact_number: z.string().min(10, 'Please enter a valid contact number'),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'ready', 'completed', 'cancelled']),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
