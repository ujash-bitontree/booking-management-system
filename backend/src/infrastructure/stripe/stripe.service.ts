import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly client: Stripe;
  constructor(config: ConfigService) {
    console.log("Inside Stripe Service >>>>>")
    const secretKey = config.getOrThrow<string>('stripe.secretKey');
    this.client = new Stripe(secretKey);
  }

  get stripe(): Stripe {
    return this.client;
  }
}
