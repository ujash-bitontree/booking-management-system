'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Doctor } from '@/src/types/doctor.types';
import { Clock, DollarSign, Star, User, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="hover:shadow-lg hover:border-sky-200/60 transition-all duration-300 h-full flex flex-col group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xl font-bold text-white">
              {doctor.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg text-slate-900 truncate">
              Dr. {doctor.fullName}
            </CardTitle>
            <CardDescription className="text-sm truncate">
              {doctor.specialization || 'General Practitioner'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-0 flex-1 flex flex-col">
        {doctor.bio && (
          <p className="text-sm text-slate-500 line-clamp-2">
            {doctor.bio}
          </p>
        )}
        <div className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{doctor.experienceYears || '5+'} years</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{formatCurrency(doctor.consultationFeeCents || 5000, doctor.currency)}</span>
          </div>
        </div>
        <Button asChild className="w-full mt-auto group-hover:bg-sky-600" size="sm">
          <Link href={`/doctors/${doctor.id}`} className="flex items-center justify-center gap-2">
            View Profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}