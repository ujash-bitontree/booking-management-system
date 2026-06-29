'use client';

import { Header } from '@/src/components/layout/Header';

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}