import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Branch } from '@/shared/api/types';
import { PageHeader } from '@/shared/components/common';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Card } from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/ui/badge';
import { exportToCsv } from '@/lib/exportCsv';

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

  const handleExport = () => {
    if (!data || data.length === 0) return;
    const dateSuffix = new Date().toISOString().slice(0, 10);
    exportToCsv(`branches_list_${dateSuffix}`, data, [
      { header: 'ID', accessor: (b) => b.id },
      { header: 'Branch Name', accessor: (b) => b.name },
      { header: 'Code', accessor: (b) => b.code },
      { header: 'Type', accessor: (b) => b.type },
      { header: 'Phone', accessor: (b) => b.phone ?? '' },
      { header: 'Email', accessor: (b) => b.email ?? '' },
      { header: 'Status', accessor: (b) => b.status },
    ]);
  };

  return (
    <div>
      <PageHeader title="Branches" description="Multi-location setup (head office, villas, restaurants)" />
      <Card className="p-4">
        <DataTable columns={columns} data={data} loading={isLoading} onExportCsv={handleExport} />
      </Card>
    </div>
  );
}