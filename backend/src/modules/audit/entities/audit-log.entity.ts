import { Column, Entity, Index } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';

@Entity({ name: 'audit_logs' })
@Index(['entityName', 'entityId'])
export class AuditLog extends BaseEntityModel {
  @Column({ nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  entityName!: string;

  @Column()
  entityId!: string;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  before!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after!: Record<string, unknown> | null;
}
