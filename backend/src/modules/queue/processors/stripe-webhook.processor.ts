import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { STRIPE_WEBHOOK_QUEUE } from '../queue.constants';
import { WebhookEvent } from '../../webhook/entities/webhook-event.entity';
import { PaymentsService } from '../../payments/payments.service';
import { StripeWebhookPayload } from '../types/stripe-webhook-payload.type';

@Processor(STRIPE_WEBHOOK_QUEUE)
@Injectable()
export class StripeWebhookProcessor extends WorkerHost {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventsRepository: Repository<WebhookEvent>,
    private readonly paymentsService: PaymentsService
  ) {
    super();
  }

  async process(job: Job<StripeWebhookPayload>) {
    const existingEvent = await this.webhookEventsRepository.findOne({
      where: { provider: 'stripe', eventId: job.data.eventId }
    });

    if (existingEvent?.processedAt) {
      return { duplicate: true, eventId: job.data.eventId };
    }

    const webhookEvent =
      existingEvent ??
      this.webhookEventsRepository.create({
        provider: 'stripe',
        eventId: job.data.eventId,
        status: 'processing',
        payload: job.data.payload,
        processedAt: null
      });

    webhookEvent.status = 'processing';
    webhookEvent.payload = job.data.payload;
    webhookEvent.processedAt = null;
    await this.webhookEventsRepository.save(webhookEvent);

    const type = job.data.type;
    if (type === 'checkout.session.completed') {
      await this.paymentsService.handleStripeCheckoutCompleted(job.data.payload as any);
    } else if (type === 'checkout.session.expired' || type === 'payment_intent.payment_failed') {
      await this.paymentsService.handleStripeCheckoutFailed(job.data.payload as any);
    }

    webhookEvent.status = 'processed';
    webhookEvent.processedAt = new Date();
    await this.webhookEventsRepository.save(webhookEvent);

    return { processed: true, eventId: job.data.eventId, type };
  }
}
