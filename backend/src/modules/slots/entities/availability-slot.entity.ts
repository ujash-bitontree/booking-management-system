import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { DoctorProfile } from '../../doctors/entities/doctor-profile.entity';

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

@Entity({ name: 'availability_slots' })
@Index(['doctorId', 'startTime', 'endTime'], { unique: true })
export class AvailabilitySlot extends BaseEntityModel {
  @Column({ type: 'int'})
  doctorId!: number;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE' })
  doctor!: DoctorProfile;

  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @Column({ type: 'timestamptz' })
  endTime!: Date;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status!: SlotStatus;

  @Column({ type: 'int', default: 1 })
  capacity!: number;
}
