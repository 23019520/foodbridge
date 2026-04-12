import { z } from 'zod';

const CATEGORIES = [
  'Fresh Produce',
  'Prepared Meals',
  'Baked Goods',
  'Dairy and Eggs',
  'Beverages',
  'Spices and Condiments',
  'Other',
] as const;

export const CreateListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  quantity: z.number().int().positive().default(1),
  location: z.string().max(100).optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images per listing').default([]),
  status: z.enum(['available', 'sold_out', 'seasonal']).default('available'),
});

export const UpdateListingSchema = CreateListingSchema.partial();

export const ListingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
export { CATEGORIES };
