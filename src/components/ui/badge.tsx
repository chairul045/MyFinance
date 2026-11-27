import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white',
        secondary:
          'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        destructive:
          'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
