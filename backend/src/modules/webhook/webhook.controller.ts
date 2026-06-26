import { Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from '../../common/decorators/public.decorator';

type StripeWebhookRequest = Request & { rawBody?: Buffer };

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @Public()
  handleStripeWebhook(
    @Req() request: StripeWebhookRequest,
    @Headers('stripe-signature') signature?: string
  ) {
    console.log('WEBHOOK CONTROLLER HIT');
    return this.webhookService.handleStripeEvent(request.rawBody, signature);
  }
}
