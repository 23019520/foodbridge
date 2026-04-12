import { query } from '../config/database';
import { OrderRow } from '../types/database.types';

/** Generates a human-readable order reference e.g. FB-2026-00042 */
const generateReference = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const result = await query(`SELECT COUNT(*) FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1`, [year]);
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `FB-${year}-${String(count).padStart(5, '0')}`;
};

export const createOrder = async (data: {
  consumer_id: string;
  producer_id: string;
  total_amount: number;
  delivery_type: string;
  delivery_address?: string;
  consumer_note?: string;
  contact_number?: string;
}): Promise<OrderRow> => {
  const reference = await generateReference();
  const result = await query(
    `INSERT INTO orders
       (consumer_id, producer_id, total_amount, delivery_type, delivery_address, consumer_note, contact_number, reference)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.consumer_id,
      data.producer_id,
      data.total_amount,
      data.delivery_type,
      data.delivery_address ?? null,
      data.consumer_note ?? null,
      data.contact_number ?? null,
      reference,
    ]
  );
  return result.rows[0];
};

export const createOrderItems = async (
  items: Array<{
    order_id: string;
    listing_id: string;
    title: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>
) => {
  // Build a multi-row INSERT for efficiency
  const values: unknown[] = [];
  const placeholders = items.map((item, i) => {
    const base = i * 6;
    values.push(item.order_id, item.listing_id, item.title, item.price, item.quantity, item.image_url ?? null);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
  });

  await query(
    `INSERT INTO order_items (order_id, listing_id, title, price, quantity, image_url)
     VALUES ${placeholders.join(', ')}`,
    values
  );
};

export const findOrderById = async (id: string) => {
  const orderResult = await query(
    `SELECT o.*, 
            c.name as consumer_name, c.phone as consumer_phone,
            p.name as producer_name, p.business_name
     FROM orders o
     JOIN users c ON o.consumer_id = c.id
     JOIN users p ON o.producer_id = p.id
     WHERE o.id = $1`,
    [id]
  );
  if (!orderResult.rows[0]) return null;

  const itemsResult = await query(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [id]
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
};

export const findOrdersByConsumer = async (consumerId: string): Promise<OrderRow[]> => {
  const result = await query(
    `SELECT o.*, p.name as producer_name, p.business_name
     FROM orders o
     JOIN users p ON o.producer_id = p.id
     WHERE o.consumer_id = $1
     ORDER BY o.created_at DESC`,
    [consumerId]
  );
  return result.rows;
};

export const findOrdersByProducer = async (producerId: string): Promise<OrderRow[]> => {
  const result = await query(
    `SELECT o.*, c.name as consumer_name, c.phone as consumer_phone
     FROM orders o
     JOIN users c ON o.consumer_id = c.id
     WHERE o.producer_id = $1
     ORDER BY o.created_at DESC`,
    [producerId]
  );
  return result.rows;
};

export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<OrderRow | null> => {
  const result = await query(
    `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] ?? null;
};
