import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from './entities/patient-profile.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile, User, Appointment]), DoctorsModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [TypeOrmModule]
})
export class PatientsModule {}
