import { Router } from 'express';
import { db } from '../../db/knex';

const router = Router();

router.get('/', async (_req, res) => {
  const state = { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString(), db: 'unknown' as string };
  try {
    await db.raw('SELECT 1');
    state.db = 'up';
  } catch {
    state.db = 'down';
    state.status = 'degraded';
    res.status(503);
  }
  res.json({ data: state });
});

export default router;