import { Router } from 'express';
import { authenticate, authorize } from '../../auth/middleware';
import { db } from '../../db/knex';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();
router.use(authenticate, authorize('audit.read'));

const auditQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(200).default(25),
  userId: z.coerce.number().int().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = auditQuery.parse(req.query);
    const qb = db('audit_logs')
      .leftJoin('users', 'users.id', 'audit_logs.user_id')
      .select('audit_logs.*', 'users.username as actor_username');

    if (q.userId) qb.where('audit_logs.user_id', q.userId);
    if (q.entityType) qb.where('audit_logs.entity_type', q.entityType);
    if (q.action) qb.where('audit_logs.action', q.action);
    if (q.from) qb.where('audit_logs.created_at', '>=', new Date(q.from));
    if (q.to) qb.where('audit_logs.created_at', '<=', new Date(q.to));

    const countRow = await qb.clone().clearSelect().clearOrder().countDistinct({ count: 'audit_logs.id' }).first();
    const total = Number(countRow?.count ?? 0);
    const items = await qb.orderBy('audit_logs.created_at', 'desc').limit(q.perPage).offset((q.page - 1) * q.perPage);

    res.json({ data: { items, total, page: q.page, perPage: q.perPage } });
  } catch (e) {
    next(e);
  }
});

export default router;
