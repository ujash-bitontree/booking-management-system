import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaymentReconciliationPayload } from '../types/payment-reconciliation-payload.type';
import { PAYMENT_RECONCILIATION_QUEUE } from '../queue.constants';
import { PaymentsService } from '../../payments/payments.service';
import { StripeService } from '../../../infrastructure/stripe/stripe.service';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Processor(PAYMENT_RECONCILIATION_QUEUE)
@Injectable()
export class PaymentReconciliationProcessor extends WorkerHost {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>
  ) {
    super();
  }

  async process(job: Job<PaymentReconciliationPayload>) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: job.data.paymentId }
    });
    console.log(payment, 'Payment in processor ::::');
    
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      return { reconciled: true, paymentId: payment.id };
    }

    if (!payment.stripeCheckoutSessionId) {
      return { reconciled: false, paymentId: payment.id };
    }

    const session = await this.stripeService.stripe.checkout.sessions.retrieve(
      payment.stripeCheckoutSessionId
    );
    console.log(session, 'Session is here >>>>>>>');

    if (session.payment_status === 'paid') {
      await this.paymentsService.handleStripeCheckoutCompleted({
        id: `reconcile-${session.id}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: session.id,
            payment_intent:
              typeof session.payment_intent === 'string' ? session.payment_intent : null,
            metadata: (session.metadata ?? {}) as Record<string, string>
          }
        }
      });
      return { reconciled: true, paymentId: payment.id };
    }

    return { reconciled: false, paymentId: payment.id };
  }
}
