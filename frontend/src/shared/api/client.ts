import type { ApiEnvelope, ApiError } from './types';

const BASE = '/api/v1';

let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((l) => l(token));
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function onAccessTokenChange(fn: (token: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: ApiError,
  ) {
    super(error.message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  retryOnAuth?: boolean;
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, retryOnAuth = true, ...rest } = options;
  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });

  if (response.status === 401 && retryOnAuth && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
    const refreshed = await refreshSession();
    if (refreshed) return rawRequest<T>(path, { ...options, retryOnAuth: false });
    setAccessToken(null);
    throw new ApiClientError(401, { code: 'UNAUTHORIZED', message: 'Session expired' });
  }

  if (!response.ok) {
    let error: ApiError = { code: 'ERROR', message: 'Request failed' };
    try {
      const parsed = (await response.json()) as { error: ApiError };
      error = parsed.error;
    } catch {
      /* ignore */
    }
    throw new ApiClientError(response.status, error);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function refreshSession(): Promise<boolean> {
  try {
    const res = (await rawRequest<ApiEnvelope<{ accessToken: string }>>('/auth/refresh', {
      method: 'POST',
      retryOnAuth: false,
    })) as unknown as { data: { accessToken: string } };
    setAccessToken(res.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<ApiEnvelope<T>> {
    return rawRequest<ApiEnvelope<T>>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<{ data: T }> {
    return rawRequest<{ data: T }>(path, { ...options, method: 'POST', body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<{ data: T }> {
    return rawRequest<{ data: T }>(path, { ...options, method: 'PATCH', body });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<{ data: T }> {
    return rawRequest<{ data: T }>(path, { ...options, method: 'DELETE' });
  },
};

export function assertOk(v: unknown): asserts v is { data: unknown } {
  void v;
}