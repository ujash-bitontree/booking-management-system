'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Appointment } from '@/src/types/appointment.types';
import { formatDateTime } from '@/src/lib/utils';
import { Calendar, Clock, User, DollarSign } from 'lucide-react';

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
  const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
    CONFIRMED: 'default',
    COMPLETED: 'default',
    PENDING_PAYMENT: 'secondary',
    CANCELLED: 'destructive',
    EXPIRED: 'destructive',
    REFUNDED: 'secondary',
    FAILED: 'destructive',
  };

  const paymentStatusColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
    SUCCEEDED: 'default',
    INITIATED: 'secondary',
    FAILED: 'destructive',
    CANCELLED: 'destructive',
    REFUNDED: 'secondary',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Appointment with Dr. {appointment.doctor?.fullName || 'Doctor'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateTime(appointment.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(appointment.slot?.startTime || appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {new Date(appointment.slot?.endTime || appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.doctor?.specialization || 'General'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {appointment.payment ? `${(appointment.payment.amount / 100).toFixed(2)} ${appointment.payment.currency}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Badge variant={statusColor[appointment.status as keyof typeof statusColor] || 'secondary'}>
              {appointment.status.replace('_', ' ')}
            </Badge>
            {appointment.payment && (
              <Badge variant={paymentStatusColor[appointment.payment.status as keyof typeof paymentStatusColor] || 'secondary'}>
                {appointment.payment.status}
              </Badge>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2">
              {appointment.status === 'PENDING_PAYMENT' && onPay && (
                <Button size="sm" onClick={() => onPay(appointment.id)}>
                  Pay Now
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
        </div>
      </CardContent>
    </Card>
  );
}