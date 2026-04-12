import { ListingCategory, ListingStatus } from '@/types/listing.types';
import { OrderStatus } from '@/types/order.types';

export const CATEGORIES: ListingCategory[] = [
  'Fresh Produce',
  'Prepared Meals',
  'Baked Goods',
  'Dairy and Eggs',
  'Beverages',
  'Spices and Condiments',
  'Other',
];

export const CATEGORY_ICONS: Record<ListingCategory, string> = {
  'Fresh Produce': '🥦',
  'Prepared Meals': '🍲',
  'Baked Goods': '🍞',
  'Dairy and Eggs': '🥚',
  'Beverages': '🥤',
  'Spices and Condiments': '🌶️',
  'Other': '🛒',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  available: 'Available',
  sold_out: 'Sold Out',
  seasonal: 'Seasonal',
  inactive: 'Inactive',
};

export const LISTING_STATUS_COLORS: Record<ListingStatus, string> = {
  available: 'bg-green-100 text-green-800',
  sold_out: 'bg-red-100 text-red-800',
  seasonal: 'bg-orange-100 text-orange-800',
  inactive: 'bg-gray-100 text-gray-600',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
] as const;
