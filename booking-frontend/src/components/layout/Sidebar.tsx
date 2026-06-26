'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '@/src/store/authStore';

interface SidebarNavItem {
  title: string;
  href: string;
  role?: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state: any) => state.user);

  if (!user) return null;

  const adminNavItems: SidebarNavItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Doctors', href: '/admin/doctors' },
    { title: 'Patients', href: '/admin/patients' },
    { title: 'Appointments', href: '/admin/appointments' },
  ];

  const doctorNavItems: SidebarNavItem[] = [
    { title: 'Profile', href: '/doctor/profile' },
    { title: 'Availability', href: '/doctor/availability' },
    { title: 'Appointments', href: '/doctor/appointments' },
  ];

  const patientNavItems: SidebarNavItem[] = [
    { title: 'Find Doctors', href: '/doctors' },
    { title: 'My Appointments', href: '/patient/appointments' },
    { title: 'Profile', href: '/patient/profile' },
  ];

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN': return adminNavItems;
      case 'DOCTOR': return doctorNavItems;
      case 'PATIENT': return patientNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground',
                  pathname === item.href && 'bg-muted text-foreground'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}