'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import api from '@/src/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Invalid session');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch appointments to find the one with matching session
        const response = await api.get('/patients/appointments');
        const appointments = response.data.items || [];
        const confirmedAppointment = appointments.find(
          (a: any) => a.payment?.stripeCheckoutSessionId === sessionId
        );

        if (confirmedAppointment) {
          // Check payment status - only show success if SUCCEEDED or COMPLETED
          const paymentStatus = confirmedAppointment.payment?.status;
          const appointmentStatus = confirmedAppointment.status;
          if (paymentStatus === 'SUCCEEDED' && appointmentStatus !== 'CANCELLED') {
            setAppointment(confirmedAppointment);
          } else {
            setError(`Payment status: ${paymentStatus?.replace('_', ' ')} - Appointment was cancelled`);
          }
        } else {
          setError('Appointment not found');
        }
      } catch (error) {
        setError('Failed to verify payment');
        console.error('Payment verification error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Payment Failed</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild>
              <Link href="/patient/appointments">View My Appointments</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-muted-foreground">Payment verification failed</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Payment Successful!</CardTitle>
          <CardDescription>
            Your appointment has been confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Appointment with Dr. {appointment.doctor?.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(appointment.scheduledAt).toLocaleDateString()} at{' '}
              {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium text-green-600">{appointment.payment.status.replace('_', ' ')}</span>
            </p>
          </div>
          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <Link href="/patient/appointments">View My Appointments</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Find More Doctors</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}