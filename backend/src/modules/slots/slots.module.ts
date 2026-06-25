import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilitySlot, DoctorProfile])],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService, TypeOrmModule]
})
export class SlotsModule {}
