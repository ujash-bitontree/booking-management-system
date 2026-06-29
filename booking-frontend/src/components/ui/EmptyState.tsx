'use client';

import { Button } from './button';
import { cn } from '@/src/lib/utils';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-8 sm:py-12', className)}>
      {icon ? (
        <div className="mb-4 text-slate-400">{icon}</div>
      ) : (
        <div className="mb-4 rounded-full bg-slate-100 p-3">
          <AlertCircle className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-5 sm:mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}