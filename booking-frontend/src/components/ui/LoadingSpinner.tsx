'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Loading...', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 sm:gap-4 py-8 sm:py-12 ${className || ''}`}>
      <Loader2 className={`animate-spin text-sky-600 ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}