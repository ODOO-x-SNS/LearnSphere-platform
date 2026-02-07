import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-5 p-4 rounded-2xl bg-surface-dim text-text-muted">{icon}</div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
