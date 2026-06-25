import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { StripeModule } from '../../infrastructure/stripe/stripe.module';
import { QueueModule } from '../queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
  imports: [StripeModule, QueueModule, TypeOrmModule.forFeature([WebhookEvent])],
  controllers: [WebhookController],
  providers: [WebhookService]
})
export class WebhookModule {}
