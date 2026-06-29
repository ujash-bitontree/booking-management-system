'use client';

import { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAppointments } from '@/src/hooks/useAppointments';
import { useAuthStore } from '@/src/store/authStore';
import { useStripe } from '@/src/hooks/useStripe';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { AppointmentCard } from '@/src/components/appointments/AppointmentCard';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/EmptyState';

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
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">My Appointments</CardTitle>
            <CardDescription>
              View and manage your booked appointments
            </CardDescription>
          </div>
          <Button asChild className="sm:w-auto">
            <Link href="/doctors">Find Doctors</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="py-10 sm:py-12">
              <EmptyState
                title="No appointments yet"
                description="You haven't booked any appointments. Find a doctor to get started."
                icon={<Calendar className="h-10 w-10 sm:h-12 sm:w-12" />}
                action={{
                  label: 'Book an appointment',
                  onClick: () => window.location.href = '/doctors'
                }}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
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