import { db, withTransaction } from '../../db/knex';
import { AppError } from '../../middleware/error';
import { hashPassword } from '../../auth/password';
import type { CreateUserInput, UpdateUserInput } from './schemas';

const PUBLIC_COLUMNS = [
  'id',
  'branch_id',
  'username',
  'email',
  'full_name',
  'phone',
  'status',
  'must_change_password',
  'last_login_at',
  'created_at',
];

export async function listUsers(params: { page: number; perPage: number; search?: string; branchId?: number }) {
  const q = db('users').select(...PUBLIC_COLUMNS);
  if (params.search) {
    q.where((b) => {
      b.whereLike('username', `%${params.search}%`)
        .orWhereLike('full_name', `%${params.search}%`)
        .orWhereLike('email', `%${params.search}%`);
    });
  }
  if (params.branchId) {
    q.whereIn('id', db('user_branch_access').select('user_id').where('branch_id', params.branchId));
  }

  const countQ = db('users');
  if (params.search) {
    countQ.where((b) => {
      b.whereLike('username', `%${params.search}%`).orWhereLike('full_name', `%${params.search}%`).orWhereLike('email', `%${params.search}%`);
    });
  }
  if (params.branchId) {
    countQ.whereIn('id', db('user_branch_access').select('user_id').where('branch_id', params.branchId));
  }
  const countRow = await countQ.countDistinct({ count: 'id' }).first();
  const total = Number(countRow?.count ?? 0);

  const rows = await q.orderBy('id', 'desc').limit(params.perPage).offset((params.page - 1) * params.perPage);
  return { items: rows, total, page: params.page, perPage: params.perPage };
}

export async function getUserDetails(userId: number) {
  const user = await db('users').where('id', userId).select(...PUBLIC_COLUMNS).first();
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  const [roles, branchAccess] = await Promise.all([
    db('user_roles').join('roles', 'roles.id', 'user_roles.role_id').where('user_roles.user_id', userId).select('roles.id', 'roles.code', 'roles.name'),
    db('user_branch_access').join('branches', 'branches.id', 'user_branch_access.branch_id').where('user_branch_access.user_id', userId).select('branches.id', 'branches.code', 'branches.name', 'user_branch_access.is_primary'),
  ]);
  return { ...user, roles, branches: branchAccess };
}

export async function createUser(input: CreateUserInput) {
  const password_hash = await hashPassword(input.password);
  const userId = await withTransaction(async (trx) => {
    const [uid] = await trx('users').insert({
      branch_id: input.primaryBranchId ?? input.branchAccess[0] ?? null,
      username: input.username,
      email: input.email,
      password_hash,
      full_name: input.full_name,
      phone: input.phone ?? null,
      status: input.status ?? 'active',
      must_change_password: true,
    });
    await trx('user_roles').insert(input.roleIds.map((role_id) => ({ user_id: uid, role_id })));
    await trx('user_branch_access').insert(
      input.branchAccess.map((branch_id, i) => ({ user_id: uid, branch_id, is_primary: branch_id === input.primaryBranchId || i === 0 })),
    );
    return uid;
  });
  return getUserDetails(userId);
}

export async function updateUser(userId: number, data: UpdateUserInput) {
  const existing = await db('users').where('id', userId).first();
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'User not found');

  await withTransaction(async (trx) => {
    const patch: Record<string, unknown> = {};
    if (data.email !== undefined) patch.email = data.email;
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.status !== undefined) patch.status = data.status;
    if (data.username !== undefined) patch.username = data.username;
    if (data.password) patch.password_hash = await hashPassword(data.password);
    if (data.primaryBranchId !== undefined) patch.branch_id = data.primaryBranchId;
    if (Object.keys(patch).length) await trx('users').where('id', userId).update(patch);

    if (data.roleIds && data.roleIds.length) {
      await trx('user_roles').where('user_id', userId).del();
      await trx('user_roles').insert(data.roleIds.map((role_id) => ({ user_id: userId, role_id })));
    }
    if (data.branchAccess && data.branchAccess.length) {
      await trx('user_branch_access').where('user_id', userId).del();
      await trx('user_branch_access').insert(
        data.branchAccess.map((branch_id, i) => ({ user_id: userId, branch_id, is_primary: branch_id === data.primaryBranchId || i === 0 })),
      );
    }
  });
  return getUserDetails(userId);
}

export async function setUserStatus(userId: number, status: 'active' | 'inactive' | 'locked') {
  const updated = await db('users').where('id', userId).update({ status });
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return getUserDetails(userId);
}

export async function resetPassword(userId: number, newPassword: string) {
  const password_hash = await hashPassword(newPassword);
  const updated = await db('users').where('id', userId).update({ password_hash, must_change_password: true });
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'User not found');
}
