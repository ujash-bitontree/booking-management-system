'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { useDoctors } from '@/src/hooks/useDoctors';
import { useAuthStore } from '@/src/store/authStore';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.string().optional(),
  consultationFeeCents: z.number().optional(),
  currency: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function DoctorProfilePage() {
  const user = useAuthStore((state:any) => state.user);
  const { getMyProfile, updateProfile, selectedDoctor, isLoading } = useDoctors();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      getMyProfile();
    }
  }, [user, getMyProfile]);

  useEffect(() => {
    if (selectedDoctor) {
      reset({
        fullName: selectedDoctor.fullName || '',
        specialization: selectedDoctor.specialization || '',
        bio: selectedDoctor.bio || '',
        experienceYears: selectedDoctor.experienceYears || '',
        consultationFeeCents: selectedDoctor.consultationFeeCents || 0,
        currency: selectedDoctor.currency || 'usd',
      });
    }
  }, [selectedDoctor, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    await updateProfile(data);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>
            Update your doctor profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Dr. John Doe"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="Cardiology, Neurology, etc."
                {...register('specialization')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input
                id="experienceYears"
                type="number"
                placeholder="10"
                {...register('experienceYears')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFeeCents">Consultation Fee (in cents, e.g., 5000 = $50.00)</Label>
              <Input
                id="consultationFeeCents"
                type="number"
                placeholder="5000"
                {...register('consultationFeeCents', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="usd"
                {...register('currency')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell patients about your expertise..."
                rows={5}
                {...register('bio')}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}