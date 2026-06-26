'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useAuth } from '@/src/hooks/useAuth';
import { useAuthStore } from '@/src/store/authStore';
import { PublicRoute } from '@/src/components/layout/PublicRoute';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const user = useAuthStore((state: any) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  useEffect(() => {
    if (!user) return;

    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }

    if (user.role === 'DOCTOR') {
      router.push('/doctor/profile');
      return;
    }

    router.push('/patient/appointments');
  }, [user, router]);

  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_44%),linear-gradient(135deg,_#f8fbff_0%,_#eef7ff_100%)] p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 shadow-2xl shadow-sky-100 backdrop-blur">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="hidden bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 p-8 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm">
                  <HeartPulse className="h-4 w-4" />
                  Care made simple
                </div>
                <h1 className="mt-6 text-3xl font-semibold">Welcome back to your care dashboard.</h1>
                <p className="mt-3 max-w-md text-sm text-sky-50/90">
                  Access appointments, doctor profiles, and patient-ready tools from one beautiful place.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/20 bg-slate-950/20 p-4">
                {['Secure authentication', 'Fast appointment access', 'Support for doctors and patients'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
                <p className="mt-2 text-sm text-slate-500">Use your email and password to continue.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
                  {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-500 sm:flex-row sm:justify-between">
                <Link href="/forgot-password" className="font-medium text-sky-700 hover:underline">
                  Forgot password?
                </Link>
                <p>
                  New here?{' '}
                  <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}