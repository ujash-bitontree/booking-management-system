import { Column, Entity, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity({ name: 'payments' })
@Index(['stripeCheckoutSessionId'], { unique: true })
export class Payment extends BaseEntityModel {
  @Column({ type: 'int' })
  appointmentId!: number;

  @OneToOne(() => Appointment, (appointment) => appointment.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment!: Appointment;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCheckoutSessionId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId!: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.INITIATED })
  status!: PaymentStatus;

  @Column({ type: 'int', default: 0 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency!: string;

  @Column({ type: 'jsonb', nullable: true })
  rawStripePayload!: Record<string, unknown> | null;
}
