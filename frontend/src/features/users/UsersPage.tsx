import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api } from '@/shared/api/client';
import type { Paginated, User } from '@/shared/api/types';
import { DataTable, type Column } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/common';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge, StatusBadge } from '@/shared/components/ui/badge';
import { exportToCsv } from '@/lib/exportCsv';
import { useToast } from '@/shared/components/ui/toast';
import { cn } from '@/lib/utils';

const columns: Column<User>[] = [
  { key: 'username', header: 'Username', render: (u) => <span className="font-medium">{u.username}</span> },
  { key: 'name', header: 'Name', render: (u) => u.full_name },
  { key: 'email', header: 'Email', render: (u) => u.email },
  {
    key: 'roles',
    header: 'Roles',
    render: (u) => (
      <div className="flex flex-wrap gap-1">
        {u.roles?.slice(0, 2).map((r) => (
          <Badge key={r.code} variant="secondary">
            {r.code}
          </Badge>
        ))}
        {(u.roles?.length ?? 0) > 2 ? <Badge variant="outline">+{(u.roles?.length ?? 0) - 2}</Badge> : null}
      </div>
    ),
  },
  { key: 'branches', header: 'Branches', render: (u) => u.branches?.map((b) => b.code).join(', ') ?? '—' },
  { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () =>
      (await api.get<Paginated<User>>(`/users?page=${page}&perPage=20&search=${encodeURIComponent(search)}`)).data,
  });

  const filteredItems = data?.items?.filter((u) => {
    if (statusFilter === 'all') return true;
    return u.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleExport = () => {
    if (!data?.items || data.items.length === 0) return;
    const dateSuffix = new Date().toISOString().slice(0, 10);
    exportToCsv(`users_list_${dateSuffix}`, data.items, [
      { header: 'ID', accessor: (u) => u.id },
      { header: 'Username', accessor: (u) => u.username },
      { header: 'Full Name', accessor: (u) => u.full_name },
      { header: 'Email', accessor: (u) => u.email },
      { header: 'Roles', accessor: (u) => u.roles?.map((r) => r.code).join('; ') ?? '' },
      { header: 'Branches', accessor: (u) => u.branches?.map((b) => b.code).join('; ') ?? '' },
      { header: 'Status', accessor: (u) => u.status },
    ]);
    toast.success('CSV Export Started', `Exported ${data.items.length} user records.`);
  };

  const handleNewUserClick = () => {
    toast.info('User Creation Modal', 'User creation form modal will land in the next feature iteration.');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Users" description="Manage user accounts, roles and branch assignments">
        <Button onClick={handleNewUserClick} className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" />
          <span>New User</span>
        </Button>
      </PageHeader>

      <Card className="p-4">
        {/* Status Filter Pills Toolbar */}
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all capitalize',
                  statusFilter === st
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {st} {st === 'all' ? `(${data?.total ?? 0})` : ''}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          loading={isLoading}
          page={page}
          total={filteredItems?.length ?? data?.total}
          perPage={20}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search users by name, email or role…"
          onExportCsv={handleExport}
        />
      </Card>
    </div>
  );
}