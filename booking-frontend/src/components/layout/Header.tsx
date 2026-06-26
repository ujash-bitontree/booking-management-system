'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '@/src/store/authStore';
import { clearAuth } from '@/src/lib/auth';
import { toast } from 'react-hot-toast';
import { Stethoscope } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);

  const handleLogout = () => {
    clearAuth();
    useAuthStore.getState().logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register') ||
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/reset-password');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg">Doctor Booking</div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Care concierge</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Button variant="ghost" asChild className="rounded-full">
                  <Link href="/admin/dashboard">Dashboard</Link>
                </Button>
              )}
              {user.role === 'DOCTOR' && (
                <>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/doctor/profile">Profile</Link>
                  </Button>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/doctor/availability">Availability</Link>
                  </Button>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/doctor/appointments">Appointments</Link>
                  </Button>
                </>
              )}
              {user.role === 'PATIENT' && (
                <>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/doctors">Find Doctors</Link>
                  </Button>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/patient/appointments">My Appointments</Link>
                  </Button>
                </>
              )}
              <Avatar className="ml-1 h-9 w-9 border border-slate-200">
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleLogout} className="rounded-full">
                Logout
              </Button>
            </>
          ) : (
            !isAuthPage && (
              <>
                <Button variant="ghost" asChild className="rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/register">Create account</Link>
                </Button>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
}