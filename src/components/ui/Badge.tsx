import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  dot?: boolean;
}

const variants = {
  default: 'bg-gray-50 text-text-secondary ring-1 ring-gray-200/80',
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200/60',
  success: 'bg-success-50 text-success-600 ring-1 ring-success-100',
  warning: 'bg-warning-50 text-warning-600 ring-1 ring-warning-100',
  danger: 'bg-danger-50 text-danger-600 ring-1 ring-danger-100',
};

const dotColors = {
  default: 'bg-gray-400',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight',
        variants[variant],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
