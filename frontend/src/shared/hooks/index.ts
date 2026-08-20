import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Branch, Permission, Role } from '@/shared/api/types';
import { useUser } from '@/app/auth-store';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get<Branch[]>('/branches')).data,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/roles')).data,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await api.get<Permission[]>('/roles/permissions')).data,
  });
}

/** True when the current user holds the given permission (or is super admin). */
export function useHasPermission(permission: string): boolean {
  const user = useUser();
  if (!user) return false;
  if (user.roles.some((r) => r.code === 'SUPER_ADMIN')) return true;
  return user.permissions?.includes(permission) ?? false;
}

export { useTheme, type Theme } from './useTheme';

