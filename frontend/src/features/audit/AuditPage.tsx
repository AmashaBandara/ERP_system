import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { AuditLog } from '@/shared/api/types';
import { PageHeader } from '@/shared/components/common';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

const columns: Column<AuditLog>[] = [
  { key: 'action', header: 'Action', render: (a) => <Badge variant="secondary">{a.action}</Badge> },
  { key: 'entity', header: 'Entity', render: (a) => `${a.entity_type}${a.entity_id ? ` #${a.entity_id}` : ''}` },
  { key: 'actor', header: 'Actor', render: (a) => a.actor_username ?? 'system' },
  { key: 'created', header: 'When', render: (a) => formatDateTime(a.created_at) },
  { key: 'ip', header: 'IP', render: (a) => a.ip_address ?? '—' },
];

export function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['audit', page],
    queryFn: async () =>
      (await api.get<{ items: AuditLog[]; total: number }>(`/audit?page=${page}&perPage=25`)).data,
  });

  return (
    <div>
      <PageHeader title="Audit Logs" description="Track mutations across the system" />
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={data?.items}
          loading={isLoading}
          page={page}
          total={data?.total}
          perPage={25}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}