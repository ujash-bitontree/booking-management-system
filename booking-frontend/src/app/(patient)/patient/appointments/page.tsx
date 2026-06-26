'use client';

import { useEffect } from 'react';
import { useAppointments } from '@/src/hooks/useAppointments';
import { useAuthStore } from '@/src/store/authStore';
import { useStripe } from '@/src/hooks/useStripe';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { AppointmentCard } from '@/src/components/appointments/AppointmentCard';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export default function PatientAppointmentsPage() {
  const user = useAuthStore((state: any) => state.user);
  const { getMyAppointments, appointments, isLoading, cancelAppointment, createCheckoutSession } = useAppointments();
  const { redirectToCheckout } = useStripe();

  useEffect(() => {
    if (user) {
      getMyAppointments();
    }
  }, [user, getMyAppointments]);

  const handlePay = async (appointmentId: string) => {
    try {
      await redirectToCheckout(appointmentId);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    await cancelAppointment(appointmentId);
    getMyAppointments();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>
              View and manage your booked appointments
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/doctors">Find Doctors</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No appointments found</p>
              <Button asChild>
                <Link href="/">Book an appointment</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment: any) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPay={handlePay}
                  onCancel={handleCancel}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}