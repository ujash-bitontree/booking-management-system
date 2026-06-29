'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Stethoscope, Filter } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useDoctors } from '@/src/hooks/useDoctors';
import { DoctorCard } from '@/src/components/doctors/DoctorCard';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export default function DoctorsPage() {
  const { listDoctors, doctors, isLoading } = useDoctors();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void listDoctors({ limit: 12 });
  }, [listDoctors]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      void listDoctors({ search: value, limit: 12 });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6 px-3 sm:px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="rounded-2xl sm:rounded-[32px] border border-slate-200/60 bg-white/85 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-sky-600">Care team</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Find doctors</h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Browse available specialists and choose a slot that fits your schedule.
            </p>
          </div>
          <div className="w-full lg:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-50/80 border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner text="Finding doctors..." />
          </div>
        ) : doctors.length > 0 ? (
          doctors.map((doctor: any) => <DoctorCard key={doctor.id} doctor={doctor} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
            <p className="text-slate-500">No doctors available right now.</p>
            <p className="mt-1 text-sm text-slate-400">Check back later for new specialists.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center pb-4">
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
