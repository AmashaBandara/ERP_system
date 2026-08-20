import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Paginated, User } from '@/shared/api/types';
import { DataTable, type Column } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/common';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge, StatusBadge } from '@/shared/components/ui/badge';
import { exportToCsv } from '@/lib/exportCsv';

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

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () =>
      (await api.get<Paginated<User>>(`/users?page=${page}&perPage=20&search=${encodeURIComponent(search)}`)).data,
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
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage accounts, roles and branch access">
        <Button onClick={() => alert('User creation dialog lands with Phase 1 UI')}>＋ New user</Button>
      </PageHeader>
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={data?.items}
          loading={isLoading}
          page={page}
          total={data?.total}
          perPage={20}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search users…"
          onExportCsv={handleExport}
        />
      </Card>
    </div>
  );
}