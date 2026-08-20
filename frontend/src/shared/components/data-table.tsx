import * as React from 'react';
import { Download, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Spinner, EmptyState } from './common';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DateFilterConfig {
  from?: string;
  to?: string;
  onFromChange?: (from: string) => void;
  onToChange?: (to: string) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  page?: number;
  total?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  onExportCsv?: () => void;
  exportLoading?: boolean;
  dateFilter?: DateFilterConfig;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  page = 1,
  total = 0,
  perPage = 20,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder,
  onExportCsv,
  exportLoading,
  dateFilter,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hasToolbar = (searchPlaceholder && onSearchChange) || dateFilter || onExportCsv;

  return (
    <div>
      {hasToolbar ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {searchPlaceholder && onSearchChange ? (
              <div className="w-full sm:w-64">
                <input
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            ) : null}

            {dateFilter ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>From:</span>
                  <input
                    type="date"
                    value={dateFilter.from ?? ''}
                    onChange={(e) => dateFilter.onFromChange?.(e.target.value)}
                    className="bg-transparent text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>To:</span>
                  <input
                    type="date"
                    value={dateFilter.to ?? ''}
                    onChange={(e) => dateFilter.onToChange?.(e.target.value)}
                    className="bg-transparent text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
                {dateFilter.from || dateFilter.to ? (
                  <button
                    onClick={() => {
                      dateFilter.onFromChange?.('');
                      dateFilter.onToChange?.('');
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear dates
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {onExportCsv ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              disabled={exportLoading || !data || data.length === 0}
              className="flex items-center gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center">
                  <Spinner className="mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {onPageChange ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} records
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}