import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { AuditLog } from '@/shared/api/types';
import { PageHeader } from '@/shared/components/common';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { exportToCsv } from '@/lib/exportCsv';

const columns: Column<AuditLog>[] = [
  { key: 'action', header: 'Action', render: (a) => <Badge variant="secondary">{a.action}</Badge> },
  { key: 'entity', header: 'Entity', render: (a) => `${a.entity_type}${a.entity_id ? ` #${a.entity_id}` : ''}` },
  { key: 'actor', header: 'Actor', render: (a) => a.actor_username ?? 'system' },
  { key: 'created', header: 'When', render: (a) => formatDateTime(a.created_at) },
  { key: 'ip', header: 'IP', render: (a) => a.ip_address ?? '—' },
];

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, from, to],
    queryFn: async () => {
      let url = `/audit?page=${page}&perPage=25`;
      if (from) url += `&from=${encodeURIComponent(from)}`;
      if (to) url += `&to=${encodeURIComponent(to)}`;
      return (await api.get<{ items: AuditLog[]; total: number }>(url)).data;
    },
  });

  const handleExport = () => {
    if (!data?.items || data.items.length === 0) return;
    const dateSuffix = new Date().toISOString().slice(0, 10);
    exportToCsv(
      `audit_logs_${dateSuffix}`,
      data.items,
      [
        { header: 'ID', accessor: (a) => a.id },
        { header: 'Action', accessor: (a) => a.action },
        { header: 'Entity Type', accessor: (a) => a.entity_type },
        { header: 'Entity ID', accessor: (a) => a.entity_id ?? '' },
        { header: 'Actor Username', accessor: (a) => a.actor_username ?? 'system' },
        { header: 'Timestamp', accessor: (a) => formatDateTime(a.created_at) },
        { header: 'IP Address', accessor: (a) => a.ip_address ?? '' },
      ]
    );
  };

  return (
    <div>
      <PageHeader title="Audit Logs" description="Track mutations and security logs across the system" />
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={data?.items}
          loading={isLoading}
          page={page}
          total={data?.total}
          perPage={25}
          onPageChange={setPage}
          dateFilter={{
            from,
            to,
            onFromChange: (val) => {
              setFrom(val);
              setPage(1);
            },
            onToChange: (val) => {
              setTo(val);
              setPage(1);
            },
          }}
          onExportCsv={handleExport}
        />
      </Card>
    </div>
  );
}