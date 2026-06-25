import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'doctor_profiles' })
export class DoctorProfile extends BaseEntityModel {
  @Column({ type: 'int' })
  userId!: number;

  @OneToOne(() => User, (user) => user.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  experienceYears!: string | null;

  @Column({ type: 'int', default: 5000 })
  consultationFeeCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency!: string;
}
