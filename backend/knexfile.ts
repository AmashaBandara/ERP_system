import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from './src/config/env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const baseConfig = {
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    timezone: '+00:00',
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'src/db/migrations'),
    extension: 'js',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: path.join(__dirname, 'src/db/seeds'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

export default baseConfig;

/** Apply stored procedures from src/db/procedures/*.sql (after migrations). */
export async function applyProcedures(): Promise<void> {
  const knex = (await import('knex')).default;
  const instance = knex(baseConfig);
  try {
    const { readFileSync } = await import('node:fs');
    const { readdir } = await import('node:fs/promises');
    const dir = path.join(__dirname, 'src/db/procedures');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      console.log(`[procedures] Applying ${file}...`);
      const sql = readFileSync(path.join(dir, file), 'utf8');
      await instance.raw(sql);
    }
    console.log('[procedures] Done.');
  } finally {
    await instance.destroy();
  }
}

const [, , command] = process.argv;
if (command === 'apply:procedures') {
  applyProcedures().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
