export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  consumer_id: string;
  producer_id: string;
  status: OrderStatus;
  delivery_type: 'delivery' | 'collection';
  delivery_address: string | null;
  consumer_note: string | null;
  contact_number: string | null;
  total_amount: number;
  reference: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  producer_name?: string;
  business_name?: string | null;
  consumer_name?: string;
  items?: OrderItem[];
}

export interface CartItem {
  listing_id: string;
  producer_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface CreateOrderInput {
  producer_id: string;
  items: Array<{ listing_id: string; quantity: number }>;
  delivery_type: 'delivery' | 'collection';
  delivery_address?: string;
  consumer_note?: string;
  contact_number: string;
}
