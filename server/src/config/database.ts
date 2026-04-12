import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * A connection pool is shared across all requests.
 * pg manages up to 10 concurrent connections by default.
 * Never create a new Pool per request — that would exhaust connections quickly.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // In production (Supabase), SSL is required
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,               // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test the database connection on startup.
 * Crashes the server if the database is unreachable.
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅  Database connected successfully');
  } catch (error) {
    logger.error('❌  Database connection failed:', error);
    throw error;
  }
};

/**
 * Helper to run a query with automatic error logging.
 * Use this instead of pool.query() directly in models.
 */
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.NODE_ENV === 'development') {
    logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 80)}`);
  }

  return result;
};
