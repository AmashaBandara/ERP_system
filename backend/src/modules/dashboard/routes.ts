import { Router } from 'express';
import { authenticate, authorize } from '../../auth/middleware';
import { db } from '../../db/knex';
import type { NextFunction, Request, Response } from 'express';

const router = Router();
router.use(authenticate, authorize('reports.dashboard.read'));

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Core Counts
    const [totalUsersRow] = await db('users').count({ count: '*' });
    const [activeUsersRow] = await db('users').where('status', 'active').count({ count: '*' });
    const [totalBranchesRow] = await db('branches').count({ count: '*' });
    const [totalRolesRow] = await db('roles').count({ count: '*' });
    
    // Today audit count
    const [todayAuditRow] = await db('audit_logs')
      .whereRaw('DATE(created_at) = CURRENT_DATE()')
      .count({ count: '*' });

    // 2. Activity Trend (Last 7 Days)
    const rawTrend = await db('audit_logs')
      .select(db.raw('DATE_FORMAT(created_at, "%Y-%m-%d") as date_str'), db.raw('COUNT(*) as total'))
      .where('created_at', '>=', db.raw('DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)'))
      .groupByRaw('DATE_FORMAT(created_at, "%Y-%m-%d")')
      .orderBy('date_str', 'asc');

    const trendMap = new Map<string, number>();
    for (const r of rawTrend as Array<{ date_str: string; total: number | string }>) {
      trendMap.set(r.date_str, Number(r.total));
    }

    const activityTrend = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      activityTrend.push({
        date: dateStr,
        label: dayLabel,
        events: trendMap.get(dateStr) ?? 0,
      });
    }

    // 3. Branch summary (User distribution)
    const branchSummary = await db('branches')
      .leftJoin('users', 'users.branch_id', 'branches.id')
      .select('branches.id', 'branches.name', 'branches.code', 'branches.type', 'branches.status')
      .count({ user_count: 'users.id' })
      .groupBy('branches.id', 'branches.name', 'branches.code', 'branches.type', 'branches.status');

    // 4. Recent Audit Logs
    const recentAuditLogs = await db('audit_logs')
      .leftJoin('users', 'users.id', 'audit_logs.user_id')
      .select(
        'audit_logs.id',
        'audit_logs.action',
        'audit_logs.entity_type',
        'audit_logs.created_at',
        'users.username as actor_username',
        'users.full_name as actor_name'
      )
      .orderBy('audit_logs.created_at', 'desc')
      .limit(6);

    // 5. System Health Info
    const memory = process.memoryUsage();
    const systemHealth = {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryHeapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
    };

    interface BranchSummaryRow {
      id: number | string;
      name: string;
      code: string;
      type: string;
      status: string;
      user_count?: number | string;
    }

    res.json({
      data: {
        counts: {
          totalUsers: Number(totalUsersRow?.count ?? 0),
          activeUsers: Number(activeUsersRow?.count ?? 0),
          totalBranches: Number(totalBranchesRow?.count ?? 0),
          totalRoles: Number(totalRolesRow?.count ?? 0),
          todayAuditEvents: Number(todayAuditRow?.count ?? 0),
        },
        activityTrend,
        branchSummary: (branchSummary as BranchSummaryRow[]).map((b) => ({
          id: Number(b.id),
          name: b.name,
          code: b.code,
          type: b.type,
          status: b.status,
          userCount: Number(b.user_count ?? 0),
        })),
        recentAuditLogs,
        systemHealth,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
