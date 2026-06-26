'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Search } from 'lucide-react';
import { useAdmin } from '@/src/hooks/useAdmin';
import { Appointment } from '@/src/types/appointment.types';

export default function AdminAppointmentsPage() {
  const { listAppointments, isLoading } = useAdmin();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await listAppointments();
      setAppointments(data);
    };
    fetchAppointments();
  }, [listAppointments]);

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.doctor?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      appointment.patient?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            Manage all appointments in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.patient?.fullName || 'N/A'}</TableCell>
                    <TableCell>{appointment.doctor?.fullName || 'N/A'}</TableCell>
                    <TableCell>
                      {appointment.scheduledAt ? format(parseISO(appointment.scheduledAt), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'
                            ? 'default'
                            : appointment.status === 'PENDING_PAYMENT'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.payment?.status === 'SUCCEEDED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {appointment.payment?.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}