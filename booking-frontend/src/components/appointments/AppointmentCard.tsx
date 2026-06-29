'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Appointment } from '@/src/types/appointment.types';
import { formatDateTime } from '@/src/lib/utils';
import { Calendar, Clock, User, DollarSign, Stethoscope, ArrowRight } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onPay?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onView?: (appointmentId: string) => void;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  onPay,
  onCancel,
  onView,
  showActions = true,
}: AppointmentCardProps) {
  const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
    CONFIRMED: 'success',
    COMPLETED: 'success',
    PENDING_PAYMENT: 'warning',
    CANCELLED: 'destructive',
    EXPIRED: 'destructive',
    REFUNDED: 'secondary',
    FAILED: 'destructive',
  };

  const paymentStatusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
    SUCCEEDED: 'success',
    INITIATED: 'warning',
    FAILED: 'destructive',
    CANCELLED: 'destructive',
    REFUNDED: 'secondary',
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Dr. {appointment.doctor?.fullName || 'Doctor'}
              </CardTitle>
              <p className="text-sm text-slate-500 font-normal">
                {appointment.doctor?.specialization || 'General Practitioner'}
              </p>
            </div>
          </div>
          <Badge variant={statusColor[appointment.status as keyof typeof statusColor] || 'secondary'}>
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-600">{formatDateTime(appointment.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-600">
              {new Date(appointment.slot?.startTime || appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {new Date(appointment.slot?.endTime || appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-600">{appointment.doctor?.specialization || 'General'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <DollarSign className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-900">
              {appointment.payment ? `$${(appointment.payment.amount / 100).toFixed(2)}` : 'N/A'}
            </span>
          </div>
        </div>

        {appointment.payment && (
          <div className="flex items-center gap-2">
            <Badge variant={paymentStatusColor[appointment.payment.status as keyof typeof paymentStatusColor] || 'secondary'}>
              {getStatusLabel(appointment.payment.status)}
            </Badge>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {appointment.status === 'PENDING_PAYMENT' && onPay && (
              <Button size="sm" onClick={() => onPay(appointment.id)} className="flex items-center gap-1.5">
                Pay Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {appointment.status === 'PENDING_PAYMENT' && onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(appointment.id)}>
                Cancel
              </Button>
            )}
            {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && onView && (
              <Button variant="outline" size="sm" onClick={() => onView(appointment.id)}>
                View Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}