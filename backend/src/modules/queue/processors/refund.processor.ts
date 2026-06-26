import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { REFUND_QUEUE } from '../queue.constants';
import { RefundPayload } from '../types/refund-payload.type';
import { StripeService } from '../../../infrastructure/stripe/stripe.service';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { PatientProfile } from '../../patients/entities/patient-profile.entity';

@Processor(REFUND_QUEUE)
@Injectable()
export class RefundProcessor extends WorkerHost {
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>
  ) {
    super();
  }

  async process(job: Job<RefundPayload>) {
    console.log(`Processing refund job: ${job.id}`, job.data);

    const { paymentId, appointmentId, patientId, amount, reason } = job.data;

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for refund');
    }

    if (!payment.stripePaymentIntentId) {
      console.warn('No Stripe payment intent found, cannot process refund');
      return { refunded: false, reason: 'no-payment-intent' };
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      console.log('Payment already refunded');
      return { refunded: false, reason: 'already-refunded' };
    }

    try {
      await this.stripeService.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });

      payment.status = PaymentStatus.REFUNDED;
      await this.paymentsRepository.save(payment);

      const patient = await this.patientProfilesRepository.findOne({
        where: { id: patientId }
      } as any);

      if (patient) {
        patient.walletBalance = (patient.walletBalance || 0) + amount;
        await this.patientProfilesRepository.save(patient);
        console.log(`Refunded ${amount} to patient wallet: ${patientId}`);
      }

      return { refunded: true, appointmentId, patientId, amount };
    } catch (error) {
      console.error('Refund failed:', error);
      return { refunded: false, reason: 'stripe-refund-failed', error: String(error) };
    }
  }
}