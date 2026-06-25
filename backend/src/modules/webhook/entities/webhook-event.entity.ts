import { Column, Entity, Index } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';

@Entity({ name: 'webhook_events' })
@Index(['provider', 'eventId'], { unique: true })
export class WebhookEvent extends BaseEntityModel {
  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  @Column({ type: 'varchar', length: 255 })
  eventId!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date | null;
}
