import { useAuthStore } from '@/app/auth-store';
import { PageHeader } from '@/shared/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const stats = [
  { key: 'rooms', label: 'Rooms' },
  { key: 'orders', label: 'Today Orders' },
  { key: 'stock', label: 'Low Stock' },
  { key: 'payroll', label: 'Pending Payroll' },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstBranch = user?.branches?.[0];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.full_name ?? ''}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Phase 1 · Completed</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Active workspace: <span className="font-medium text-foreground">{firstBranch?.name ?? '—'}</span>
          </p>
          <p className="mt-2">
            Authentication, RBAC, user/role/branch management and audit logging are wired to the API.
            Accommodation, POS, inventory, HR and finance modules are scaffolded in the database and open next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}