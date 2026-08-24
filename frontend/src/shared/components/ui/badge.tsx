import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-emerald-500/15 text-emerald-700',
        warning: 'border-transparent bg-amber-500/15 text-amber-700',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    active: 'success',
    ACTIVE: 'success',
    AVAILABLE: 'success',
    COMPLETED: 'success',
    PAID: 'success',
    inactive: 'secondary',
    INACTIVE: 'secondary',
    PENDING: 'warning',
    OPEN: 'warning',
    locked: 'destructive',
    CANCELLED: 'destructive',
    CANCELLED_: 'destructive',
  };

  const variant = map[status] ?? 'secondary';

  const dotColors = {
    success: 'bg-emerald-500 shadow-emerald-500/50',
    warning: 'bg-amber-500 shadow-amber-500/50',
    destructive: 'bg-rose-500 shadow-rose-500/50',
    secondary: 'bg-slate-400',
  };

  return (
    <Badge variant={variant} className="gap-1.5 capitalize font-medium">
      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotColors[variant])} />
      {status.toLowerCase()}
    </Badge>
  );
}