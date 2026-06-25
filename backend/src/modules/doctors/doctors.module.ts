import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { User } from '../users/entities/user.entity';
import { AvailabilitySlot } from '../slots/entities/availability-slot.entity';
import { SlotsModule } from '../slots/slots.module';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, User, AvailabilitySlot]), SlotsModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService, TypeOrmModule]
})
export class DoctorsModule {}
