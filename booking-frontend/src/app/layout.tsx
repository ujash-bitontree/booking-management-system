import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Doctor Booking System',
  description: 'Book appointments with doctors easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-slate-50/30">
            <main className="flex-1">{children}</main>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'rounded-xl border border-slate-200 shadow-lg',
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}