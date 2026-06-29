'use client';

import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppointments } from '@/src/hooks/useAppointments';
import { useAuthStore } from '@/src/store/authStore';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';

export default function DoctorAppointmentsPage() {
  const user = useAuthStore((state: any) => state.user);
  const { getDoctorAppointments, appointments, isLoading } = useAppointments();

  useEffect(() => {
    if (user) {
      getDoctorAppointments();
    }
  }, [user, getDoctorAppointments]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patientName || 'Unknown'}
                      <div className="text-xs text-muted-foreground">
                        {appointment.patientEmail || ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.slotTime
                        ? format(new Date(appointment.slotTime), 'MMM dd, yyyy HH:mm')
                        : appointment.scheduledAt
                          ? format(new Date(appointment.scheduledAt), 'MMM dd, yyyy HH:mm')
                          : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={appointment.paymentStatus === 'SUCCEEDED' ? 'default' : 'outline'}>
                        {appointment.paymentStatus === 'SUCCEEDED'
                          ? `$${(appointment.amount || 0) / 100}`
                          : appointment.paymentStatus || 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}