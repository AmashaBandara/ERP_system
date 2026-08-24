import * as React from 'react';
import { Loader2, SearchX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-muted-foreground', className)} />;
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted/70', className)} {...props} />;
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center space-x-4 px-4 py-2">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search query or clear existing filters.',
  onReset,
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
        <SearchX className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-4 gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}