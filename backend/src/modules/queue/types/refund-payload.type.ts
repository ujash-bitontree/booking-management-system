export type RefundPayload = {
  paymentId: string;
  appointmentId: string;
  patientId: number;
  amount: number;
  reason: string;
};