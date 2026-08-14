import knex from 'knex';
import { env } from '../config/env';

export const db = knex({
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    timezone: '+00:00',
    dateStrings: false,
    supportBigNumbers: true,
  },
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10000,
});

/** Run `fn` inside a transaction, rolling back on error. */
export async function withTransaction<T>(
  fn: (trx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}

export async function assertDatabaseConnection(): Promise<void> {
  await db.raw('SELECT 1');
}

/** Low-stock warning threshold used by the stock:low socket event. */
export const LOW_STOCK_THRESHOLD = 5;
