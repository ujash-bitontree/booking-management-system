'use client';

import { ProtectedRoute } from '@/src/components/layout/ProtectedRoute';
import { Header } from '@/src/components/layout/Header';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['DOCTOR']}>
      <div className="min-h-screen w-full">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}