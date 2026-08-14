import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Role } from '@/shared/api/types';
import { PageHeader } from '@/shared/components/common';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

const columns: Column<Role>[] = [
  { key: 'name', header: 'Role', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'code', header: 'Code', render: (r) => <Badge variant="secondary">{r.code}</Badge> },
  { key: 'description', header: 'Description', render: (r) => r.description ?? '—' },
  { key: 'permissions', header: 'Permissions', render: (r) => <span className="text-muted-foreground">{r.is_system ? 'System' : `${r.permissions?.length ?? 0} perms`}</span> },
];

export function RolesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/roles')).data,
  });

  return (
    <div>
      <PageHeader title="Roles & Permissions" description="Assign permission keys to roles (RBAC)" />
      <Card className="p-4">
        <DataTable columns={columns} data={data} loading={isLoading} />
      </Card>
    </div>
  );
}