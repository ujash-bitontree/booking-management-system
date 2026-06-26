'use client';

import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppointments } from '@/src/hooks/useAppointments';
import { useAuthStore } from '@/src/store/authStore';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { AppointmentCard } from '@/src/components/appointments/AppointmentCard';

export default function DoctorAppointmentsPage() {
  const user = useAuthStore((state: any) => state.user);
  const { getMyAppointments, appointments, isLoading } = useAppointments();

  useEffect(() => {
    if (user) {
      getMyAppointments();
    }
  }, [user, getMyAppointments]);

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>
            View and manage your upcoming appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appointments found
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}