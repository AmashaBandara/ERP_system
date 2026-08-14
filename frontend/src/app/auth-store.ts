import { create } from 'zustand';
import { api } from '@/shared/api/client';
import { setAccessToken } from '@/shared/api/client';
import type { User } from '@/shared/api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: 'idle',
  login: async (username, password) => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', { username, password });
    setAccessToken(res.data.accessToken);
    set({ user: res.data.user, token: res.data.accessToken, status: 'authenticated' });
  },
  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    set({ user: null, token: null, status: 'unauthenticated' });
  },
  fetchMe: async () => {
    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },
  setUser: (user) => set({ user, status: 'authenticated' }),
}));

export function useUser(): User | null {
  return useAuthStore((s) => s.user);
}
