export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'locked';
  roles: Array<{ id: number; code: string; name: string }>;
  permissions?: string[];
  branches: Array<{ id: number; code: string; name: string; is_primary: boolean }>;
  must_change_password?: boolean;
  created_at?: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions?: string[];
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  key: string;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  phone: string | null;
  email: string | null;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  actor_username: string | null;
  created_at: string;
  ip_address: string | null;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}