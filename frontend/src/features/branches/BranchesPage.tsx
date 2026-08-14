import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Branch } from '@/shared/api/types';
import { PageHeader } from '@/shared/components/common';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Card } from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/ui/badge';

const columns: Column<Branch>[] = [
  { key: 'name', header: 'Branch', render: (b) => <span className="font-medium">{b.name}</span> },
  { key: 'code', header: 'Code', render: (b) => <span className="text-muted-foreground">{b.code}</span> },
  { key: 'type', header: 'Type', render: (b) => b.type },
  { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
];

export function BranchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get<Branch[]>('/branches')).data,
  });

  return (
    <div>
      <PageHeader title="Branches" description="Multi-location setup (head office, villas, restaurants)" />
      <Card className="p-4">
        <DataTable columns={columns} data={data} loading={isLoading} />
      </Card>
    </div>
  );
}