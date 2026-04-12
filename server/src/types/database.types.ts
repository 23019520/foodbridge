/**
 * These types mirror the exact columns in each PostgreSQL table.
 * Keep these in sync with your migration SQL files.
 */

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'consumer' | 'producer' | 'admin';
  phone: string | null;
  area: string | null;
  bio: string | null;
  business_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ListingRow {
  id: string;
  producer_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  quantity: number;
  location: string | null;
  images: string[];
  status: 'available' | 'sold_out' | 'seasonal' | 'inactive';
  order_count: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: string;
  consumer_id: string;
  producer_id: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  delivery_type: 'delivery' | 'collection';
  delivery_address: string | null;
  consumer_note: string | null;
  contact_number: string | null;
  total_amount: number;
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  listing_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface CommissionRow {
  id: string;
  order_id: string;
  producer_id: string;
  order_total: number;
  rate: number;
  amount: number;
  status: 'pending' | 'invoiced' | 'paid';
  created_at: Date;
}
