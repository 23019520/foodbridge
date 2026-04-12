import { query } from '../config/database';
import { UserRow } from '../types/database.types';

/**
 * All SQL queries relating to the users table live here.
 * Models only run queries — they do not contain business logic.
 */

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
  return result.rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<UserRow | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
  return result.rows[0] ?? null;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  area?: string;
  business_name?: string;
  bio?: string;
}): Promise<UserRow> => {
  const result = await query(
    `INSERT INTO users (name, email, password, role, phone, area, business_name, bio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name,
      data.email,
      data.password,
      data.role,
      data.phone ?? null,
      data.area ?? null,
      data.business_name ?? null,
      data.bio ?? null,
    ]
  );
  return result.rows[0];
};

export const updateUser = async (
  id: string,
  data: Partial<Pick<UserRow, 'name' | 'phone' | 'area' | 'bio' | 'business_name' | 'avatar_url'>>
): Promise<UserRow | null> => {
  const fields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
  if (fields.length === 0) return findUserById(id);

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map((f) => data[f as keyof typeof data]);

  const result = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0] ?? null;
};

/** Returns a safe public profile (no password) */
export const getPublicProfile = async (id: string) => {
  const result = await query(
    `SELECT id, name, business_name, bio, area, avatar_url, role, created_at
     FROM users WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0] ?? null;
};
