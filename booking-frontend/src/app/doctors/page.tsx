'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Search, Stethoscope } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useDoctors } from '@/src/hooks/useDoctors';
import { DoctorCard } from '@/src/components/doctors/DoctorCard';

export default function DoctorsPage() {
  const { listDoctors, doctors, isLoading } = useDoctors();

  useEffect(() => {
    void listDoctors({ limit: 12 });
  }, [listDoctors]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Care team</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Find doctors</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Browse available specialists and choose a slot that fits your schedule.
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or specialty"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              onChange={(event) => {
                void listDoctors({ search: event.target.value, limit: 12 });
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            Loading doctors...
          </div>
        ) : doctors.length > 0 ? (
          doctors.map((doctor: any) => <DoctorCard key={doctor.id} doctor={doctor} />)
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            No doctors available right now.
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/patient/appointments">
            <Stethoscope className="mr-2 h-4 w-4" />
            View my appointments
          </Link>
        </Button>
      </div>
    </div>
  );
}
