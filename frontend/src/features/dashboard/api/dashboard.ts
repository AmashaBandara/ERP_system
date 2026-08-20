import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export interface DashboardStats {
  counts: {
    totalUsers: number;
    activeUsers: number;
    totalBranches: number;
    totalRoles: number;
    todayAuditEvents: number;
  };
  activityTrend: Array<{
    date: string;
    label: string;
    events: number;
  }>;
  branchSummary: Array<{
    id: number;
    name: string;
    code: string;
    type: string;
    status: string;
    userCount: number;
  }>;
  recentAuditLogs: Array<{
    id: number;
    action: string;
    entity_type: string;
    created_at: string;
    actor_username: string | null;
    actor_name: string | null;
  }>;
  systemHealth: {
    status: string;
    uptimeSeconds: number;
    memoryHeapUsedMB: number;
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get<DashboardStats>('/dashboard/stats');
      return res.data;
    },
    refetchInterval: 30_000, // auto refresh every 30s
  });
}
