import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from './auth-store';
import { onAccessTokenChange } from '@/shared/api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    void fetchMe();
    const off = onAccessTokenChange((token) => {
      if (token) void fetchMe();
    });
    return off;
  }, [fetchMe]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}