import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default:
        'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
      primary:
        'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
      success:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      warning:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      danger:
        'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300',
      info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs font-medium',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
