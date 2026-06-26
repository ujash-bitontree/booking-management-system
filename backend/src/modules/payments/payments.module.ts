import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeModule } from '../../infrastructure/stripe/stripe.module';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Appointment, PatientProfile]),
    StripeModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule]
})
export class PaymentsModule {}
