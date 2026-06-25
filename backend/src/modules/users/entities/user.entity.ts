import { Column, Entity, Index, OneToOne } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { Role } from '../../../common/enums/role.enum';
import { DoctorProfile } from '../../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../../patients/entities/patient-profile.entity';

@Entity({ name: 'users' })
export class User extends BaseEntityModel {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToOne(() => DoctorProfile, (profile) => profile.user)
  doctorProfile?: DoctorProfile;

  @OneToOne(() => PatientProfile, (profile) => profile.user)
  patientProfile?: PatientProfile;
}
