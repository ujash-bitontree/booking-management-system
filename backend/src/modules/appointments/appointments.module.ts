import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AvailabilitySlot } from '../slots/entities/availability-slot.entity';
import { Payment } from '../payments/entities/payment.entity';
import { QueueModule } from '../queue/queue.module';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, AvailabilitySlot, PatientProfile, Payment]), QueueModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService, TypeOrmModule]
})
export class AppointmentsModule {}
