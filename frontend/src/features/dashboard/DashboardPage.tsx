import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Building2,
  Shield,
  Activity,
  CheckCircle2,
  ArrowRight,
  Clock,
  Cpu,
  Server,
  Layers,
  ScrollText,
} from 'lucide-react';

import { useAuthStore } from '@/app/auth-store';
import { PageHeader, Skeleton } from '@/shared/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { useDashboardStats } from './api/dashboard';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const primaryBranch = user?.branches?.[0];
  const { data, isLoading, isError } = useDashboardStats();

  const counts = data?.counts ?? {
    totalUsers: 0,
    activeUsers: 0,
    totalBranches: 0,
    totalRoles: 0,
    todayAuditEvents: 0,
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('login') || action.includes('create')) return 'default';
    if (action.includes('update') || action.includes('grant')) return 'secondary';
    if (action.includes('delete') || action.includes('revoke') || action.includes('lock')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & System Overview */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.full_name ?? 'User'} 👋`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-xs">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Active Location: <strong className="font-semibold text-foreground">{primaryBranch?.name ?? 'Head Office'}</strong></span>
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>System Online</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <Card className="relative overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Users
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-baseline">
              {isLoading ? (
                <Skeleton className="h-8 w-16 my-1" />
              ) : (
                <>
                  {counts.activeUsers}
                  <span className="text-xs font-normal text-muted-foreground ml-1.5">/ {counts.totalUsers} total</span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Accounts active in ERP</span>
            </p>
          </CardContent>
        </Card>

        {/* Operating Branches */}
        <Card className="relative overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Locations & Branches
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12 my-1" /> : counts.totalBranches}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3 text-primary" />
              <span>Ernie's Retreat & Nanga's Kitchen</span>
            </p>
          </CardContent>
        </Card>

        {/* Security Roles */}
        <Card className="relative overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-purple-500 before:to-pink-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security Roles
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12 my-1" /> : counts.totalRoles}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Enforced granular RBAC permissions</p>
          </CardContent>
        </Card>

        {/* Today Audit Events */}
        <Card className="relative overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Audit Events Today
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12 my-1" /> : counts.todayAuditEvents}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Recorded actions today</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 7-Day Activity Trend Chart (2 Columns wide) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">7-Day System Activity Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Audit log interaction frequency over the last 7 days</p>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              Live DB Metrics
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Loading activity metrics...
              </div>
            ) : isError ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-destructive">
                Failed to load activity trends.
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val} actions`, 'Audit Events']}
                    />
                    <Area
                      type="monotone"
                      dataKey="events"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorEvents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Access per Branch</CardTitle>
            <p className="text-xs text-muted-foreground font-normal">Assigned staff breakdown across locations</p>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Loading branch user stats...
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.branchSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="code" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val} staff members`, 'Users']}
                    />
                    <Bar dataKey="userCount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Recent System Activity Feed & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Audit Activity Table (2 Columns wide) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                Recent System Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground">Live feed of latest actions recorded in audit logs</p>
            </div>
            <Link
              to="/audit"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View full audit log <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading recent logs...</div>
              ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No recent system logs found.</div>
              ) : (
                data.recentAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3.5 px-6 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs uppercase text-muted-foreground">
                        {log.actor_username ? log.actor_username.slice(0, 2) : 'SY'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {log.actor_name || log.actor_username || 'System'}
                          </span>
                          <Badge variant={getActionBadgeVariant(log.action)} className="text-[10px] uppercase px-1.5 py-0">
                            {log.action}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Target entity: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{log.entity_type}</code>
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation & System Status Widget */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <p className="text-xs text-muted-foreground">Shortcuts to core administration modules</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                to="/users"
                className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>User Management</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/roles"
                className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Roles & Permissions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/branches"
                className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <span>Branches & Locations</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/audit"
                className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <ScrollText className="h-4 w-4 text-amber-500" />
                  <span>Security Audit Logs</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* System Performance Status */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  Server Health
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-700/60 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-slate-400" /> Memory Heap:
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {data?.systemHealth?.memoryHeapUsedMB ?? '—'} MB
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700/60 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Node Uptime:
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {data?.systemHealth?.uptimeSeconds
                    ? `${Math.floor(data.systemHealth.uptimeSeconds / 60)} mins`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-medium text-emerald-400">MySQL 8 (Connected)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}