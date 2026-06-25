import { Column, Entity, Index, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
import { PatientProfile } from '../../patients/entities/patient-profile.entity';
import { DoctorProfile } from '../../doctors/entities/doctor-profile.entity';
import { AvailabilitySlot } from '../../slots/entities/availability-slot.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity({ name: 'appointments' })
@Index(['slotId'])
@Index(['patientId', 'doctorId'])
export class Appointment extends BaseEntityModel {
  @Column({ type: 'int' })
  slotId!: number;

  @Column({ type: 'int' })
  doctorId!: number;

  @Column({ type: 'int' })
  patientId!: number;

  @ManyToOne(() => AvailabilitySlot, { onDelete: 'CASCADE' })
  slot!: AvailabilitySlot;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE' })
  doctor!: DoctorProfile;

  @ManyToOne(() => PatientProfile, { onDelete: 'CASCADE' })
  patient!: PatientProfile;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING_PAYMENT })
  status!: AppointmentStatus;

  @Column({ type: 'timestamptz' })
  scheduledAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  paymentId!: number | null;

  @OneToOne(() => Payment, (payment) => payment.appointment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment | null;
}
