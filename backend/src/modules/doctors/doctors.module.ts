import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { User } from '../users/entities/user.entity';
import { AvailabilitySlot } from '../slots/entities/availability-slot.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';
import { SlotsModule } from '../slots/slots.module';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, User, AvailabilitySlot, Appointment, Payment, PatientProfile]), SlotsModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService, TypeOrmModule]
})
export class DoctorsModule {}
