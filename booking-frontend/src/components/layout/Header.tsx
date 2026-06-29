'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Stethoscope, LogOut, User, Calendar, Users, Clock, Shield, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '@/src/store/authStore';
import { clearAuth } from '@/src/lib/auth';
import { toast } from 'react-hot-toast';
import { useWalletBalance } from '@/src/hooks/useWalletBalance';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { walletBalance, fetchWalletBalance } = useWalletBalance();

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      fetchWalletBalance();
    }
  }, [user, fetchWalletBalance]);

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

  const navLinks = [];
  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin/dashboard', label: 'Dashboard', icon: Shield });
  } else if (user?.role === 'DOCTOR') {
    navLinks.push({ href: '/doctor/profile', label: 'Profile', icon: User });
    navLinks.push({ href: '/doctor/availability', label: 'Availability', icon: Clock });
    navLinks.push({ href: '/doctor/appointments', label: 'Appointments', icon: Calendar });
  } else if (user?.role === 'PATIENT') {
    navLinks.push({ href: '/doctors', label: 'Find Doctors', icon: Users });
    navLinks.push({ href: '/patient/appointments', label: 'My Appointments', icon: Calendar });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 font-semibold text-slate-900">
          <div className="rounded-xl sm:rounded-2xl bg-sky-100 p-1.5 sm:p-2 text-sky-700">
            <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg">Doctor Booking</div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Care concierge</div>
          </div>
          <div className="sm:hidden">
            <div className="text-base">Doctor Booking</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {user && navLinks.map((link) => (
            <Button key={link.href} variant="ghost" asChild className="rounded-full px-3">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {user?.role === 'PATIENT' && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    ${walletBalance.toFixed(2)}
                  </span>
                </div>
              )}
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src="https://static.vecteezy.com/system/resources/thumbnails/034/342/056/small/doctor-with-stethoscope-confident-young-man-in-white-coat-looking-at-camera-and-smiling-while-standing-against-blue-background-portrait-of-confident-young-medical-doctor-ai-generated-free-photo.jpg" />
                <AvatarFallback className="text-xs">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleLogout} className="rounded-full px-4 text-sm">
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </Button>
            </>
          ) : (
            !isAuthPage && (
              <>
                <Button variant="ghost" asChild className="rounded-full px-4">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-full px-4">
                  <Link href="/register">Create account</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {user && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
            {!user && !isAuthPage && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sky-600 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}