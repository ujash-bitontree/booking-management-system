'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarHeart, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useAuthStore } from '@/src/store/authStore';

export default function HomePage() {
  const user = useAuthStore((state: any) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (user.role === 'DOCTOR') {
      router.push('/doctor/profile');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-sky-100 bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 p-8 text-white shadow-2xl shadow-sky-900/20">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Modern care booking for busy clinics
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Book appointments with trusted doctors in minutes.
              </h1>
              <p className="max-w-2xl text-lg text-sky-50/90">
                Discover specialists, reserve a time slot, and manage care from one polished experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-sky-700 hover:bg-sky-50">
                <Link href="/doctors">
                  Browse doctors <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/60 bg-white/10 text-white hover:bg-white/20">
                <Link href="/patient/appointments">My appointments</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/20 bg-slate-950/20 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3"><CalendarHeart className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-sky-100">Fast onboarding</p>
                <p className="text-xl font-semibold">Secure, simple booking</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                'Instant doctor discovery',
                'Flexible slot selection',
                'Payments and appointment tracking',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

