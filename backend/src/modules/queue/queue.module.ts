import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BOOKING_EXPIRATION_QUEUE,
  PAYMENT_RECONCILIATION_QUEUE,
  STRIPE_WEBHOOK_QUEUE
} from './queue.constants';
import { BookingExpirationProcessor } from './processors/booking-expiration.processor';
import { PaymentReconciliationProcessor } from './processors/payment-reconciliation.processor';
import { StripeWebhookProcessor } from './processors/stripe-webhook.processor';
import { WebhookEvent } from '../webhook/entities/webhook-event.entity';
import { StripeModule } from '../../infrastructure/stripe/stripe.module';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsModule } from '../payments/payments.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    StripeModule,
    PaymentsModule,
    EventsModule,
    TypeOrmModule.forFeature([WebhookEvent, Payment]),
    BullModule.registerQueue(
      { name: BOOKING_EXPIRATION_QUEUE },
      { name: PAYMENT_RECONCILIATION_QUEUE },
      { name: STRIPE_WEBHOOK_QUEUE }
    )
  ],
  providers: [
    BookingExpirationProcessor,
    PaymentReconciliationProcessor,
    StripeWebhookProcessor
  ],
  exports: [BullModule],
})
export class QueueModule {}
