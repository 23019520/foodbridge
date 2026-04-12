export type ListingStatus = 'available' | 'sold_out' | 'seasonal' | 'inactive';

export type ListingCategory =
  | 'Fresh Produce'
  | 'Prepared Meals'
  | 'Baked Goods'
  | 'Dairy and Eggs'
  | 'Beverages'
  | 'Spices and Condiments'
  | 'Other';

export interface Listing {
  id: string;
  producer_id: string;
  title: string;
  description: string | null;
  price: number;
  category: ListingCategory;
  quantity: number;
  location: string | null;
  images: string[];
  status: ListingStatus;
  order_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined from users table
  producer_name: string;
  business_name: string | null;
  producer_avatar: string | null;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  price: number;
  category: ListingCategory;
  quantity: number;
  location?: string;
  images: string[];
  status: ListingStatus;
}

export interface ListingFilters {
  category?: ListingCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}
