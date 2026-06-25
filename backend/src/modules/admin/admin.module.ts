import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSeeder } from './admin.seeder';
import { User } from '../users/entities/user.entity';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, DoctorProfile, PatientProfile, Appointment])],
  controllers: [AdminController],
  providers: [AdminService, AdminSeeder]
})
export class AdminModule {}
