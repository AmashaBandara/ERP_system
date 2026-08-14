import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../services/audit';
import * as svc from './services';
import {
  createUserSchema,
  idParam,
  paginationQuery,
  updateUserSchema,
} from './schemas';
import { z } from 'zod';

function actorId(req: Request): number | null {
  return req.user ? Number(req.user.sub) : null;
}

function auditContext(req: Request) {
  return {
    user_id: actorId(req),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] ?? null,
  };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = paginationQuery.parse(req.query);
    const result = await svc.listUsers(q);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParam.parse(req.params);
    const result = await svc.getUserDetails(id);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createUserSchema.parse(req.body);
    const result = await svc.createUser(body);
    await writeAudit({ ...auditContext(req), action: 'user.create', entity_type: 'users', entity_id: result.id, after_json: { username: result.username } });
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParam.parse(req.params);
    const body = updateUserSchema.parse(req.body);
    const result = await svc.updateUser(id, body);
    await writeAudit({ ...auditContext(req), action: 'user.update', entity_type: 'users', entity_id: id });
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function setStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParam.parse(req.params);
    const { status } = z.object({ status: z.enum(['active', 'inactive', 'locked']) }).parse(req.body);
    const result = await svc.setUserStatus(id, status);
    await writeAudit({ ...auditContext(req), action: 'user.status', entity_type: 'users', entity_id: id, after_json: { status } });
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParam.parse(req.params);
    const { newPassword } = z.object({ newPassword: z.string().min(8).max(128) }).parse(req.body);
    await svc.resetPassword(id, newPassword);
    await writeAudit({ ...auditContext(req), action: 'user.reset_password', entity_type: 'users', entity_id: id });
    res.json({ data: { success: true } });
  } catch (e) {
    next(e);
  }
}

export function requireSelfOrSuperAdmin(req: Request): void {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  const { id } = idParam.parse(req.params);
  if (Number(req.user.sub) !== id && !req.user.roles.includes('SUPER_ADMIN')) {
    throw new AppError(403, 'FORBIDDEN', 'Cannot modify another user');
  }
}
