import { db } from '../../db/knex';
import { AppError } from '../../middleware/error';
import { hashPassword, verifyPassword } from '../../auth/password';
import {
  findUserById,
  findUserByUsername,
  getBranchAccess,
  getPermissionsForUser,
  getRolesForUser,
} from '../../services/auth-queries';
import { signAccessToken } from '../../auth/jwt';
import { issueRefreshToken, revokeRefreshToken } from '../../services/session';
import type { AccessTokenPayload } from '../../auth/jwt';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

async function buildPayload(userId: number): Promise<AccessTokenPayload> {
  const [roles, permissions, branches] = await Promise.all([
    getRolesForUser(userId),
    getPermissionsForUser(userId),
    getBranchAccess(userId),
  ]);
  const user = await findUserById(userId);
  return {
    sub: String(userId),
    username: user?.username ?? '',
    roles: roles.map((r) => r.code),
    permissions: permissions.map((p) => p.key),
    branches: branches.map((b) => Number(b.branch_id)),
  };
}

export async function login(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');

  if (user.status === 'locked' && user.locked_until && user.locked_until > new Date()) {
    throw new AppError(423, 'ACCOUNT_LOCKED', 'Account is locked. Try again later.');
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    const attempts = user.failed_login_attempts + 1;
    const update: { failed_login_attempts: number; status?: string; locked_until?: Date | null } = {
      failed_login_attempts: attempts,
    };
    if (attempts >= MAX_ATTEMPTS) {
      update.status = 'locked';
      update.locked_until = new Date(Date.now() + LOCK_MS);
      update.failed_login_attempts = 0;
      await db('users').where('id', user.id).update(update);
      throw new AppError(423, 'ACCOUNT_LOCKED', 'Too many failed attempts. Account locked for 15 minutes.');
    }
    await db('users').where('id', user.id).update(update);
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  if (user.status === 'inactive') {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Account is inactive');
  }

  await db('users')
    .where('id', user.id)
    .update({ failed_login_attempts: 0, locked_until: null, last_login_at: new Date() });

  const payload = await buildPayload(user.id);
  const accessToken = signAccessToken(payload);
  const refreshToken = await issueRefreshToken(user.id);
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      roles: payload.roles,
      permissions: payload.permissions,
      branches: payload.branches,
      must_change_password: user.must_change_password,
    },
  };
}

export async function refresh(refreshToken: string) {
  const { refreshToken: newToken, userId } = await rotateForRefresh(refreshToken);
  const payload = await buildPayload(userId);
  return { accessToken: signAccessToken(payload), refreshToken: newToken };
}

async function rotateForRefresh(refreshToken: string) {
  const { rotateRefreshToken } = await import('../../services/session');
  return rotateRefreshToken(refreshToken);
}

export async function logout(refreshToken?: string): Promise<void> {
  if (refreshToken) await revokeRefreshToken(refreshToken);
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await findUserById(userId);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect');
  const password_hash = await hashPassword(newPassword);
  await db('users')
    .where('id', userId)
    .update({ password_hash, must_change_password: false });
}

export async function me(userId: number) {
  const payload = await buildPayload(userId);
  const user = await findUserById(userId);
  return {
    id: user?.id,
    username: user?.username,
    email: user?.email,
    full_name: user?.full_name,
    roles: payload.roles,
    permissions: payload.permissions,
    branches: payload.branches,
    must_change_password: user?.must_change_password,
  };
}

export { buildPayload };
