import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { StripeService } from '../../infrastructure/stripe/stripe.service';
import { AvailabilitySlot, SlotStatus } from '../slots/entities/availability-slot.entity';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

type StripeCheckoutCompletedEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_intent: string | null;
      metadata?: Record<string, string>;
    };
  };
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>,
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService
  ) { }

  async createCheckoutSession(patientId: string, appointmentId: string) {

    const patientProfile = await this.patientProfilesRepository.findOne({
      where: {
        userId: Number(patientId),
      },
    });

    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const appointment = await this.appointmentsRepository.findOne({
      where: {
        id: appointmentId,
        patientId: patientProfile.id,
      },

      relations: ['payment', 'doctor'],
    } as any);

    console.log(appointment, 'APPOINTMENT DATA HERE <<<<');

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Appointment is not pending payment');
    }

    if (appointment.expiresAt && appointment.expiresAt < new Date()) {
      throw new BadRequestException('Appointment payment window expired');
    }

    const payment = appointment.payment
      ? appointment.payment
      : await this.paymentsRepository.findOne({ where: { appointmentId } as any });

    console.log(payment, 'Payment data here <<<<');
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.stripeCheckoutSessionId) {
      return {
        appointmentId,
        sessionId: payment.stripeCheckoutSessionId,
        url: null,
        reused: true
      };
    }

    const doctor = appointment.doctor as DoctorProfile | undefined;
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    if (payment.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const frontendUrl = this.configService.getOrThrow<string>('frontend.url');
    console.log(frontendUrl, 'FRONTEND URL HERE <<<<<<<');

    const checkoutSession = await this.stripeService.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: payment.currency,
            unit_amount: payment.amount,
            product_data: {
              name: `Doctor consultation with ${doctor.fullName}`
            }
          }
        }
      ],
      metadata: {
        appointmentId: appointment.id,
        paymentId: payment.id,
        patientId,
        doctorId: appointment.doctorId,
        slotId: appointment.slotId
      },
      success_url: `${frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/appointments/${appointment.id}?payment=cancelled`
    });

    console.log(checkoutSession, 'checkoutSession :::::');

    payment.stripeCheckoutSessionId = checkoutSession.id;
    payment.rawStripePayload = checkoutSession as unknown as Record<string, unknown>;
    payment.status = PaymentStatus.INITIATED;
    // payment.status = PaymentStatus.SUCCEEDED; // Set status to COMPLETED when checkout session is created
    await this.paymentsRepository.save(payment);

    return {
      appointmentId,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    };
  }

  async handleStripeCheckoutCompleted(event: StripeCheckoutCompletedEvent) {
    console.log(event, 'STRIPE EVENT <<<<<<<<<<')
    console.log("Inside handle Stripe Checkout complete >>>>>>>>");
    const checkoutSession = event?.data?.object;
    console.log(event?.data, 'event data')
    console.log(checkoutSession, 'Checkout session data here <<<<<');
    const appointmentId = checkoutSession?.metadata?.appointmentId;
    const paymentId = checkoutSession?.metadata?.paymentId;

    if (!appointmentId || !paymentId) {
      throw new BadRequestException('Stripe event is missing appointment metadata');
    }

    return this.dataSource.transaction(async (manager) => {
      // const appointment = await manager.findOne(Appointment, {
      //   where: { id: appointmentId },
      //   relations: ['payment', 'slot'],
      //   lock: { mode: 'pessimistic_write' }
      // });

      const appointment = await manager
        .createQueryBuilder(Appointment, 'appointment')
        .leftJoinAndSelect('appointment.payment', 'payment')
        .leftJoinAndSelect('appointment.slot', 'slot')
        .where('appointment.id = :id', { id: appointmentId })
        .setLock('pessimistic_write', undefined, ['appointment'])
        .getOne();


      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' }
      });


      console.log(payment, 'payment in payment service <<<<<');

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (

        (appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.COMPLETED) &&
        console.log(payment.status, 'Payment status here <<<<<') &&
        payment.status === PaymentStatus.SUCCEEDED
      ) {
        return { confirmed: true, appointmentId };
      }

      if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
        return { confirmed: false, reason: 'appointment-not-pending' };
      }

      appointment.status = AppointmentStatus.COMPLETED;
      payment.status = PaymentStatus.SUCCEEDED;
      payment.stripePaymentIntentId = checkoutSession.payment_intent;
      payment.rawStripePayload = event as unknown as Record<string, unknown>;
      await manager.save(payment);
      await manager.save(appointment);

      // Deduct from patient's wallet
      const patientToDeduct = await manager.findOne(PatientProfile, {
        where: { id: appointment.patientId }
      }as any);
      if (patientToDeduct && patientToDeduct.walletBalance > 0) {
        const deductionAmount = Math.min(payment.amount, patientToDeduct.walletBalance);
        patientToDeduct.walletBalance -= deductionAmount;
        await manager.save(patientToDeduct);
        console.log(`Deducted ${deductionAmount} from patient wallet: ${appointment.patientId}`);
      }

      const otherPendingAppointments = await manager.find(Appointment, {
        where: {
          slotId: appointment.slotId,
          status: AppointmentStatus.PENDING_PAYMENT
        }
      });
      console.log(otherPendingAppointments, 'Other pending appointments <<<<<');

      for (const otherAppointment of otherPendingAppointments) {
        if (otherAppointment.id === appointment.id) {
          continue;
        }

        otherAppointment.status = AppointmentStatus.CANCELLED;
        await manager.save(otherAppointment);

        if (otherAppointment.paymentId) {
          const otherPayment = await manager.findOne(Payment, {
            where: { id: otherAppointment.paymentId }
          }as any);

          console.log(otherPayment, 'Other payment data here <<<<<');
          console.log(otherPayment?.status, 'Other payment status <<<<<<')
          if (otherPayment?.status === PaymentStatus.SUCCEEDED && otherPayment.stripePaymentIntentId) {
            // Process refund synchronously so Stripe shows it as "refunded" immediately
            try {
              await this.stripeService.stripe.refunds.create({
                payment_intent: otherPayment.stripePaymentIntentId,
                reason: 'requested_by_customer'
              });
              otherPayment.status = PaymentStatus.REFUNDED;
              await manager.save(otherPayment);

              // Credit refund to patient's wallet
              const refundPatient = await manager.findOne(PatientProfile, {
                where: { id: otherAppointment.patientId }
              }as any);
              if (refundPatient) {
                refundPatient.walletBalance = (refundPatient.walletBalance || 0) + otherPayment.amount;
                await manager.save(refundPatient);
              }
              console.log(`Processed refund for duplicate payment: ${otherPayment.id}`);
            } catch (refundError) {
              console.error('Refund failed:', refundError);
              await manager.update(
                Payment,
                { appointmentId: otherAppointment.id },
                { status: PaymentStatus.CANCELLED, rawStripePayload: event as unknown as Record<string, unknown> } as any
              );
            }
          } else {
            await manager.update(
              Payment,
              { appointmentId: otherAppointment.id },
              { status: PaymentStatus.CANCELLED, rawStripePayload: event as unknown as Record<string, unknown> } as any
            );
          }
        }
      }

      const slot = await manager.findOne(AvailabilitySlot, {
        where: { id: appointment.slotId },
        lock: { mode: 'pessimistic_write' }
      } as any);

      console.log(slot, 'Booked slot done >>>>>>>');

      if (slot) {
        slot.status = SlotStatus.BOOKED;
        await manager.save(slot);
      }

      return { confirmed: true, appointmentId };
    });
  }

  async handleStripeCheckoutFailed(event: StripeCheckoutCompletedEvent) {
    const checkoutSession = event.data.object;
    const appointmentId = checkoutSession.metadata?.appointmentId;
    if (!appointmentId) {
      throw new BadRequestException('Stripe event is missing appointment metadata');
    }

    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: ['payment'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
        return { failed: false };
      }

      appointment.status = AppointmentStatus.FAILED;
      await manager.save(appointment);

      if (appointment.payment) {
        appointment.payment.status = PaymentStatus.FAILED;
        await manager.save(appointment.payment);
      }

      return { failed: true };
    });
  }
}
