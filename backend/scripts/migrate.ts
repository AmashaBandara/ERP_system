import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readdir, readFile } from 'node:fs/promises';
import mysql, { type Pool, type Connection } from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(__dirname, '../src/db/sql');
const PROCEDURES_DIR = path.join(__dirname, '../src/db/procedures');
const TRACKING_TABLE = 'schema_migrations';

const CONN = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'waikkal',
  password: process.env.DB_PASSWORD ?? 'waikkal',
  database: process.env.DB_NAME ?? 'waikkal_erp',
  charset: 'utf8mb4',
  timezone: 'Z',
  connectTimeout: 6000,
};

let pool: Pool = mysql.createPool({ ...CONN, connectionLimit: 3 });

const MAX_ATTEMPTS = 8;

/** Run a query, retrying across fresh connections when a socket stalls. */
async function execStmt(stmt: string, timeoutMs = 20000): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const c = await mysql.createConnection({ ...CONN, multipleStatements: true });
    try {
      await withTimeout(c.query(stmt), timeoutMs);
      return;
    } catch (e) {
      await c.end().catch(() => undefined);
      if (e instanceof Error && e.message.startsWith('TIMEOUT')) {
        console.warn(`[sql] stall on attempt ${attempt}, retrying...`);
        continue;
      }
      if (e instanceof Error && (/(ECONN|ETIMEDOUT|ENOTFOUND|PROTOCOL|PoolTimeout|max pool)/i.test(e.message))) {
        console.warn(`[sql] conn error (${e.message}), retry ${attempt}...`);
        continue;
      }
      throw e;
    }
  }
  throw new Error(`[db] failed after ${MAX_ATTEMPTS} attempts: ${stmt.slice(0, 60)}...`);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function splitStatements(sql: string): string[] {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function ensureTracking(): Promise<void> {
  await execStmt(`CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
    name VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

async function runSqlFiles(dir: string, prefix: string): Promise<string[]> {
  const applied: string[] = [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const where = await execQuery(`SELECT 1 FROM ${TRACKING_TABLE} WHERE name = ?`, [prefix + file]);
    if (Array.isArray(where) && where.length > 0) continue;

    const sql = await readFile(path.join(dir, file), 'utf8');
    for (const stmt of splitStatements(sql)) {
      await execStmt(stmt);
    }
    await execQuery(`INSERT INTO ${TRACKING_TABLE} (name) VALUES (?)`, [prefix + file]);
    applied.push(file);
    console.log(`[${prefix}] applied ${file}`);
  }
  return applied;
}

export async function execQuery<T = unknown[]>(sql: string, params?: unknown[]): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const c = await pool.getConnection();
    try {
      const [rows] = await withTimeout(c.query(sql, params as any), 15000);
      return rows as T;
    } catch (e) {
      c.release();
      if (e instanceof Error && e.message.startsWith('TIMEOUT')) {
        console.warn('[db] query stall, retrying...');
        continue;
      }
      throw e;
    }
  }
  throw new Error('[db] could not complete query');
}

export async function migrateLatest(): Promise<string[]> {
  await ensureTracking();
  return runSqlFiles(SQL_DIR, '');
}

export async function applyProcedures(): Promise<string[]> {
  await ensureTracking();
  return runSqlFiles(PROCEDURES_DIR, 'proc:');
}

export async function resetDatabase(): Promise<void> {
  await pool.end().catch(() => undefined);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let admin: Connection | undefined;
    try {
      admin = await mysql.createConnection({
        ...CONN,
        user: process.env.DB_ROOT_USER ?? 'root',
        password: process.env.DB_ROOT_PASSWORD ?? 'root',
        database: undefined,
        multipleStatements: true,
      });
      await withTimeout(admin.query(`DROP DATABASE IF EXISTS ${CONN.database}`), 15000);
      await withTimeout(admin.query(`CREATE DATABASE ${CONN.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`), 15000);
      break;
    } catch (e) {
      await admin?.end().catch(() => undefined);
      console.warn(`[db] reset stall (${attempt}), retrying...`);
    }
  }
  pool = mysql.createPool({ ...CONN, connectionLimit: 3 });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const cmd = process.argv[2] ?? 'migrate';
  (async () => {
    if (cmd === 'reset') {
      await resetDatabase();
    }
    const applied = cmd === 'procedures' ? await applyProcedures() : await migrateLatest();
    console.log(`[sql] done (${applied.length} applied)`);
  })()
    .then(async () => {
      await pool.end();
    })
    .catch(async (e) => {
      console.error('[sql] ERROR:', e);
      await pool.end();
      process.exit(1);
    });
}