import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export const getPlatformStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, listings, orders, commissions] = await Promise.all([
      query(`SELECT COUNT(*) FROM users WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM listings WHERE is_deleted = false`),
      query(`SELECT COUNT(*), COALESCE(SUM(total_amount), 0) as gmv FROM orders WHERE status = 'completed'`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE status = 'pending'`),
    ]);

    sendSuccess(res, {
      totalUsers: parseInt(users.rows[0].count, 10),
      totalListings: parseInt(listings.rows[0].count, 10),
      totalCompletedOrders: parseInt(orders.rows[0].count, 10),
      grossMerchandiseValue: parseFloat(orders.rows[0].gmv),
      pendingCommissions: parseFloat(commissions.rows[0].total),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req.query as Record<string, unknown>);
    const countResult = await query(`SELECT COUNT(*) FROM users`);
    const dataResult = await query(
      `SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    sendSuccess(res, {
      users: dataResult.rows,
      meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const setUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') throw new AppError('is_active must be true or false.', 400);

    const result = await query(
      `UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, is_active`,
      [req.params.id, is_active]
    );
    if (!result.rows[0]) throw new AppError('User not found.', 404);

    sendSuccess(res, { user: result.rows[0] }, 200, `User account ${is_active ? 'activated' : 'deactivated'}.`);
  } catch (error) {
    next(error);
  }
};

export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req.query as Record<string, unknown>);
    const countResult = await query(`SELECT COUNT(*) FROM listings WHERE is_deleted = false`);
    const dataResult = await query(
      `SELECT l.*, u.name as producer_name FROM listings l
       JOIN users u ON l.producer_id = u.id
       WHERE l.is_deleted = false
       ORDER BY l.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    sendSuccess(res, {
      listings: dataResult.rows,
      meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const hardDeleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `UPDATE listings SET is_deleted = true, status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rows[0]) throw new AppError('Listing not found.', 404);
    sendSuccess(res, null, 200, 'Listing removed from platform.');
  } catch (error) {
    next(error);
  }
};

export const getAllCommissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req.query as Record<string, unknown>);
    const countResult = await query(`SELECT COUNT(*) FROM commissions`);
    const dataResult = await query(
      `SELECT c.*, o.reference as order_reference, u.name as producer_name
       FROM commissions c
       JOIN orders o ON c.order_id = o.id
       JOIN users u ON c.producer_id = u.id
       ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    sendSuccess(res, {
      commissions: dataResult.rows,
      meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
    });
  } catch (error) {
    next(error);
  }
};
