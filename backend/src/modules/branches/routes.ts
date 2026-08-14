import { Router } from 'express';
import { authenticate, authorize } from '../../auth/middleware';
import { db } from '../../db/knex';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../services/audit';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const branchSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(1).max(120),
  type: z.enum(['HEAD_OFFICE', 'HOTEL', 'VILLA', 'RESORT', 'RESTAURANT', 'CATERING', 'CLOUD_KITCHEN']),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  currency: z.string().length(3).default('LKR'),
  timezone: z.string().max(64).default('Asia/Colombo'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const branchIdSchema = z.object({ id: z.coerce.number().int().positive() });

function auditCtx(req: Request) {
  return { user_id: req.user ? Number(req.user.sub) : null, ip_address: req.ip, user_agent: req.headers['user-agent'] ?? null };
}

router.get('/', authorize('branches.read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await db('branches').select('*').orderBy('id');
    res.json({ data: branches });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authorize('branches.read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = branchIdSchema.parse(req.params);
    const branch = await db('branches').where('id', id).first();
    if (!branch) throw new AppError(404, 'NOT_FOUND', 'Branch not found');
    res.json({ data: branch });
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('branches.create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = branchSchema.parse(req.body);
    const [id] = await db('branches').insert(body);
    await writeAudit({ ...auditCtx(req), action: 'branch.create', entity_type: 'branches', entity_id: id });
    res.status(201).json({ data: await db('branches').where('id', id).first() });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authorize('branches.update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = branchIdSchema.parse(req.params);
    const body = branchSchema.partial().parse(req.body);
    const updated = await db('branches').where('id', id).update(body);
    if (!updated) throw new AppError(404, 'NOT_FOUND', 'Branch not found');
    await writeAudit({ ...auditCtx(req), action: 'branch.update', entity_type: 'branches', entity_id: id });
    res.json({ data: await db('branches').where('id', id).first() });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('branches.delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = branchIdSchema.parse(req.params);
    const deleted = await db('branches').where('id', id).del();
    if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Branch not found');
    await writeAudit({ ...auditCtx(req), action: 'branch.delete', entity_type: 'branches', entity_id: id });
    res.json({ data: { success: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
