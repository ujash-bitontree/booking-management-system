'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Doctor } from '@/src/types/doctor.types';
import { Clock, DollarSign, Star, User } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {doctor.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
            <CardDescription className="text-sm">
              {doctor.specialization || 'General Practitioner'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {doctor.bio}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{doctor.experienceYears || '5+'} years</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(doctor.consultationFeeCents || 5000, doctor.currency)}</span>
          </div>
        </div>
        <Button asChild className="w-full" size="sm">
          <Link href={`/doctors/${doctor.id}`}>
            View Profile & Book
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}