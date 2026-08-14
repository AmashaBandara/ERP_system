import { Router } from 'express';
import { authenticate, authorize } from '../../auth/middleware';
import { db } from '../../db/knex';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../services/audit';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const roleSchema = z.object({
  code: z.string().min(2).max(60),
  name: z.string().min(1).max(120),
  description: z.string().max(255).optional().nullable(),
  permissionKeys: z.array(z.string()).optional(),
});

const roleIdSchema = z.object({ id: z.coerce.number().int().positive() });

function auditCtx(req: Request) {
  return {
    user_id: req.user ? Number(req.user.sub) : null,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] ?? null,
  };
}

async function roleWithPermissions(id: number) {
  const role = await db('roles').where('id', id).first();
  if (!role) throw new AppError(404, 'NOT_FOUND', 'Role not found');
  const perms = await db('role_permissions')
    .join('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('role_permissions.role_id', id)
    .select('permissions.key', 'permissions.module', 'permissions.action');
  return { ...role, permissions: perms.map((p) => p.key) };
}

router.get('/', authorize('roles.read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await db('roles').select('id', 'code', 'name', 'description', 'is_system').orderBy('id');
    res.json({ data: roles });
  } catch (e) {
    next(e);
  }
});

router.get('/permissions', authorize('permissions.read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const perms = await db('permissions').select('id', 'module', 'action', 'key').orderBy('module').orderBy('action');
    res.json({ data: perms });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authorize('roles.read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = roleIdSchema.parse(req.params);
    res.json({ data: await roleWithPermissions(id) });
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('roles.create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = roleSchema.parse(req.body);
    const [id] = await db('roles').insert({ code: body.code, name: body.name, description: body.description ?? null, is_system: false });
    if (body.permissionKeys?.length) {
      const permIds = await db('permissions').whereIn('key', body.permissionKeys).select('id');
      await db('role_permissions').insert(permIds.map((p) => ({ role_id: id, permission_id: p.id })));
    }
    await writeAudit({ ...auditCtx(req), action: 'role.create', entity_type: 'roles', entity_id: id });
    res.status(201).json({ data: await roleWithPermissions(id) });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authorize('roles.update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = roleIdSchema.parse(req.params);
    const body = roleSchema.partial().parse(req.body);
    const existing = await db('roles').where('id', id).first();
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Role not found');
    if (existing.is_system) throw new AppError(400, 'SYSTEM_ROLE', 'System roles cannot be modified');

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (Object.keys(patch).length) await db('roles').where('id', id).update(patch);

    if (body.permissionKeys !== undefined) {
      await db('role_permissions').where('role_id', id).del();
      const permIds = await db('permissions').whereIn('key', body.permissionKeys).select('id');
      await db('role_permissions').insert(permIds.map((p) => ({ role_id: id, permission_id: p.id })));
    }
    await writeAudit({ ...auditCtx(req), action: 'role.update', entity_type: 'roles', entity_id: id });
    res.json({ data: await roleWithPermissions(id) });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('roles.delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = roleIdSchema.parse(req.params);
    const existing = await db('roles').where('id', id).first();
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Role not found');
    if (existing.is_system) throw new AppError(400, 'SYSTEM_ROLE', 'System roles cannot be deleted');
    await db('roles').where('id', id).del();
    await writeAudit({ ...auditCtx(req), action: 'role.delete', entity_type: 'roles', entity_id: id });
    res.json({ data: { success: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
