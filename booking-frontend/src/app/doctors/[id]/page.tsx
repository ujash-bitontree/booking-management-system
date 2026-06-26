'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { useDoctors } from '@/src/hooks/useDoctors';
import { useAppointments } from '@/src/hooks/useAppointments';
import { useAuthStore } from '@/src/store/authStore';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Calendar, Clock, DollarSign, User, Mail, Award, ArrowLeft } from 'lucide-react';
import api from '@/src/lib/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/src/components/ui/dialog';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;
  const { getDoctor, selectedDoctor, isLoading: isDoctorLoading } = useDoctors();
  const { createAppointment } = useAppointments();
  const user = useAuthStore((state) => state.user);
  const [slots, setSlots] = useState<any[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      await getDoctor(doctorId);
      fetchSlots();
    };
    fetchData();
  }, [doctorId, getDoctor]);

  const fetchSlots = async () => {
    setIsSlotsLoading(true);
    try {
      const response = await api.get<{ items: any[] }>(`/doctors/slots/public/${doctorId}`);
      setSlots(response.data.items || []);
    } catch {
      toast.error('Failed to fetch doctor slots');
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      router.push('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (user.role !== 'PATIENT') {
      toast.error('Only patients can book appointments');
      return;
    }

    try {
      const appointment = await createAppointment({
        slotId: selectedSlot.id,
        doctorId: Number(doctorId),
        scheduledAt: selectedSlot.startTime,
      });

      toast.success('Appointment created! Please complete payment.');
      router.push('/patient/appointments');
    } catch (error) {
      toast.error('Failed to create appointment');
    }
  };

  if (isDoctorLoading) {
    return <LoadingSpinner text="Loading doctor..." />;
  }

  if (!selectedDoctor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <EmptyState
          title="Doctor not found"
          description="The doctor you're looking for doesn't exist"
          icon={<User className="h-12 w-12" />}
          action={{ label: 'Back to Doctors', onClick: () => router.push('/') }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {selectedDoctor.fullName.charAt(0)}
                  </span>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{selectedDoctor.fullName}</h1>
                  <p className="text-muted-foreground">{selectedDoctor.specialization || 'General Practitioner'}</p>
                </div>
                <div className="w-full border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedDoctor.email}</span>
                    </div>
                    {selectedDoctor.experienceYears && (
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDoctor.experienceYears} years experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${(selectedDoctor.consultationFeeCents / 100).toFixed(2)} per consultation</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About Dr. {selectedDoctor.fullName.split(' ')[1]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {selectedDoctor.bio || 'No bio available for this doctor.'}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>
                Select a time slot to book an appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSlotsLoading ? (
                <LoadingSpinner text="Loading slots..." />
              ) : slots.length === 0 ? (
                <EmptyState
                  title="No available slots"
                  description="This doctor doesn't have any available slots"
                  icon={<Calendar className="h-12 w-12" />}
                />
              ) : (
                <div className="grid gap-4">
                  {slots
                    .filter((slot) => slot.status === 'AVAILABLE')
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {format(parseISO(slot.startTime), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(slot.startTime), 'hh:mm a')} -{' '}
                              {format(parseISO(slot.endTime), 'hh:mm a')}
                            </div>
                          </div>
                          <div>
                            <Badge variant="default">Available</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSlot && user?.role === 'PATIENT' && (
            <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Appointment</DialogTitle>
                  <DialogDescription>
                    Please confirm your appointment details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium">{selectedDoctor.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialization:</span>
                    <span className="font-medium">{selectedDoctor.specialization || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(parseISO(selectedSlot.startTime), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {format(parseISO(selectedSlot.startTime), 'hh:mm a')} -{' '}
                      {format(parseISO(selectedSlot.endTime), 'hh:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="font-medium">
                      ${(selectedDoctor.consultationFeeCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBookAppointment}>
                    Confirm & Proceed to Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}