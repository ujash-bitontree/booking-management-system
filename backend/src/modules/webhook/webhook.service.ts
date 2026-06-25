import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Stripe from 'stripe';
import { StripeService } from '../../infrastructure/stripe/stripe.service';
import { STRIPE_WEBHOOK_QUEUE } from '../queue/queue.constants';

@Injectable()
export class WebhookService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly config: ConfigService,
    @InjectQueue(STRIPE_WEBHOOK_QUEUE) private readonly stripeWebhookQueue: Queue
  ) {}

  async handleStripeEvent(rawBody: Buffer | undefined, signature?: string) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Invalid webhook payload');
    }

    const webhookSecret = this.config.getOrThrow<string>('stripe.webhookSecret');
    let event: Stripe.Event;

    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch {
      throw new BadRequestException('Stripe signature verification failed');
    }

    await this.stripeWebhookQueue.add(
      'stripe-event',
      {
        eventId: event.id,
        type: event.type,
        payload: event
      },
      {
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    return {
      received: true,
      verified: true,
      eventId: event.id,
      type: event.type
    };
  }
}
