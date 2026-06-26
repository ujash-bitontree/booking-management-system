'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { useAuth } from '@/src/hooks/useAuth';
import { PublicRoute } from '@/src/components/layout/PublicRoute';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['PATIENT', 'DOCTOR']),
  phoneNumber: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'PATIENT',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    await register(data);
  };

  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_44%),linear-gradient(135deg,_#f8fbff_0%,_#eef7ff_100%)] p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 shadow-2xl shadow-sky-100 backdrop-blur">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="hidden bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 p-8 text-white lg:flex lg:flex-col lg:justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm">
                <Stethoscope className="h-4 w-4" />
                Start your care journey
              </div>
              <h1 className="mt-6 text-3xl font-semibold">Create a profile and book your next appointment.</h1>
              <p className="mt-3 max-w-md text-sm text-sky-50/90">
                Whether you are a patient looking for care or a doctor ready to manage availability, this workspace keeps everything organized.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-semibold tracking-tight">Create account</h2>
                <p className="mt-2 text-sm text-slate-500">Join today and start booking in minutes.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" {...formRegister('fullName')} />
                  {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" {...formRegister('email')} />
                  {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...formRegister('password')} />
                  {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select defaultValue="PATIENT" onValueChange={(value) => setValue('role', value as RegisterFormData['role'], { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PATIENT">Patient</SelectItem>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm font-medium text-destructive">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input id="phoneNumber" type="tel" placeholder="+1234567890" {...formRegister('phoneNumber')} />
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}