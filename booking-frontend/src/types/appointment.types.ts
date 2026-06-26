import { SlotStatus } from './doctor.types';

export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'FAILED';

export interface Appointment {
  id: string;
  slotId: number;
  doctorId: number;
  patientId: number;
  status: AppointmentStatus;
  scheduledAt: string;
  expiresAt: string | null;
  paymentId: number | null;
  slot?: Slot;
  doctor?: {
    id: string;
    fullName: string;
    specialization: string | null;
    email: string;
  };
  patient?: {
    id: string;
    fullName: string;
    email: string;
  };
  payment?: Payment;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  id: string;
  doctorId: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  capacity: number;
}

export interface CreateAppointmentDto {
  slotId: number;
  doctorId: number;
  scheduledAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  rawStripePayload: any;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus =
  | 'INITIATED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface CheckoutSessionResponse {
  appointmentId: string;
  sessionId: string;
  url: string | null;
  reused: boolean;
}