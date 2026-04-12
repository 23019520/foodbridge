import { query } from '../config/database';
import { ListingRow } from '../types/database.types';
import { CreateListingInput, UpdateListingInput } from '../schemas/listing.schemas';

export const createListing = async (
  producerId: string,
  data: CreateListingInput
): Promise<ListingRow> => {
  const result = await query(
    `INSERT INTO listings (producer_id, title, description, price, category, quantity, location, images, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      producerId,
      data.title,
      data.description ?? null,
      data.price,
      data.category,
      data.quantity,
      data.location ?? null,
      data.images,
      data.status,
    ]
  );
  return result.rows[0];
};

export const findListings = async (filters: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: string;
  limit: number;
  offset: number;
}): Promise<{ rows: ListingRow[]; total: number }> => {
  const conditions: string[] = ['is_deleted = false', "status != 'inactive'"];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.category) {
    conditions.push(`category = $${paramIndex++}`);
    values.push(filters.category);
  }
  if (filters.search) {
    conditions.push(
      `to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramIndex++})`
    );
    values.push(filters.search);
  }
  if (filters.minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex++}`);
    values.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex++}`);
    values.push(filters.maxPrice);
  }
  if (filters.location) {
    conditions.push(`location ILIKE $${paramIndex++}`);
    values.push(`%${filters.location}%`);
  }

  const orderMap: Record<string, string> = {
    newest: 'created_at DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    popular: 'order_count DESC',
  };
  const orderBy = orderMap[filters.sortBy ?? 'newest'] ?? 'created_at DESC';

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) FROM listings ${whereClause}`,
    values
  );

  const dataResult = await query(
    `SELECT l.*, u.name as producer_name, u.business_name, u.avatar_url as producer_avatar
     FROM listings l
     JOIN users u ON l.producer_id = u.id
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...values, filters.limit, filters.offset]
  );

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

export const findListingById = async (id: string): Promise<ListingRow | null> => {
  const result = await query(
    `SELECT l.*, u.name as producer_name, u.business_name, u.area as producer_area, u.avatar_url as producer_avatar
     FROM listings l
     JOIN users u ON l.producer_id = u.id
     WHERE l.id = $1 AND l.is_deleted = false`,
    [id]
  );
  return result.rows[0] ?? null;
};

export const findListingsByProducer = async (producerId: string): Promise<ListingRow[]> => {
  const result = await query(
    `SELECT * FROM listings WHERE producer_id = $1 AND is_deleted = false ORDER BY created_at DESC`,
    [producerId]
  );
  return result.rows;
};

export const updateListing = async (
  id: string,
  producerId: string,
  data: UpdateListingInput
): Promise<ListingRow | null> => {
  const fields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
  if (fields.length === 0) return findListingById(id);

  const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
  const values = fields.map((f) => data[f as keyof typeof data]);

  const result = await query(
    `UPDATE listings SET ${setClause}, updated_at = NOW()
     WHERE id = $1 AND producer_id = $2 AND is_deleted = false
     RETURNING *`,
    [id, producerId, ...values]
  );
  return result.rows[0] ?? null;
};

export const softDeleteListing = async (id: string, producerId: string): Promise<boolean> => {
  const result = await query(
    `UPDATE listings SET is_deleted = true, updated_at = NOW()
     WHERE id = $1 AND producer_id = $2`,
    [id, producerId]
  );
  return (result.rowCount ?? 0) > 0;
};
