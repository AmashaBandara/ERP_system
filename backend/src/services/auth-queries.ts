import { db } from '../db/knex';

export interface PermissionRow {
  key: string;
}

export interface RoleRow {
  code: string;
}

export interface BranchAccessRow {
  branch_id: number;
  is_primary: boolean;
}

export interface UserAuth {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  status: string;
  must_change_password: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
  full_name: string;
}

export async function findUserByUsername(username: string): Promise<UserAuth | null> {
  const row = await db('users')
    .where('username', username)
    .orWhere('email', username)
    .select(
      'id',
      'username',
      'email',
      'password_hash',
      'status',
      'must_change_password',
      'failed_login_attempts',
      'locked_until',
      'full_name',
    )
    .first();
  return row ?? null;
}

export async function findUserById(id: number): Promise<UserAuth | null> {
  const row = await db('users')
    .where('id', id)
    .select(
      'id',
      'username',
      'email',
      'password_hash',
      'status',
      'must_change_password',
      'failed_login_attempts',
      'locked_until',
      'full_name',
    )
    .first();
  return row ?? null;
}

export async function getRolesForUser(userId: number): Promise<RoleRow[]> {
  return db('user_roles')
    .join('roles', 'roles.id', 'user_roles.role_id')
    .where('user_roles.user_id', userId)
    .select('roles.code');
}

export async function getPermissionsForUser(userId: number): Promise<PermissionRow[]> {
  return db('user_roles')
    .join('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
    .join('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('user_roles.user_id', userId)
    .distinct('permissions.key')
    .select('permissions.key');
}

export async function getBranchAccess(userId: number): Promise<BranchAccessRow[]> {
  return db('user_branch_access')
    .where('user_id', userId)
    .select('branch_id', 'is_primary');
}
