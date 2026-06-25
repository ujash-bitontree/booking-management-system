import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'patient_profiles' })
export class PatientProfile extends BaseEntityModel {
  @Column({ type: 'int' })
  userId!: number;

  @OneToOne(() => User, (user) => user.patientProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber!: string | null;
}
