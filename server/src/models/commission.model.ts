import { query } from '../config/database';
import { CommissionRow } from '../types/database.types';

const COMMISSION_RATE = 0.03; // 3%

export const createCommission = async (
  orderId: string,
  producerId: string,
  orderTotal: number
): Promise<CommissionRow> => {
  const amount = parseFloat((orderTotal * COMMISSION_RATE).toFixed(2));
  const result = await query(
    `INSERT INTO commissions (order_id, producer_id, order_total, rate, amount)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orderId, producerId, orderTotal, COMMISSION_RATE, amount]
  );
  return result.rows[0];
};

export const findCommissionsByProducer = async (
  producerId: string,
  limit: number,
  offset: number
): Promise<{ rows: CommissionRow[]; total: number }> => {
  const countResult = await query(
    `SELECT COUNT(*) FROM commissions WHERE producer_id = $1`,
    [producerId]
  );
  const dataResult = await query(
    `SELECT c.*, o.reference as order_reference
     FROM commissions c
     JOIN orders o ON c.order_id = o.id
     WHERE c.producer_id = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [producerId, limit, offset]
  );
  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

export const getTotalCommissionOwed = async (producerId: string): Promise<number> => {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE producer_id = $1 AND status = 'pending'`,
    [producerId]
  );
  return parseFloat(result.rows[0].total);
};
