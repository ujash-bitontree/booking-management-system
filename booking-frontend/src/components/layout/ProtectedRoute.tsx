'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { hasRole } from '@/src/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'DOCTOR' | 'PATIENT')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
      } else if (allowedRoles && !hasRole(allowedRoles)) {
        router.push('/');
      }
    }
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !hasRole(allowedRoles)) return null;

  return <>{children}</>;
}