import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto';
import { Role } from '../../common/enums/role.enum';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { AvailabilitySlot, SlotStatus } from '../slots/entities/availability-slot.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorProfilesRepository: Repository<DoctorProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AvailabilitySlot)
    private readonly slotsRepository: Repository<AvailabilitySlot>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>,
    private readonly dataSource: DataSource
  ) {}

  async listPublicDoctors(query: ListDoctorsQueryDto) {
    const qb = this.doctorProfilesRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('doctor.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere('(doctor.fullName ILIKE :search OR doctor.specialization ILIKE :search)', {
        search: `%${query.search}%`
      });
    }

    if (query.specialization) {
      qb.andWhere('doctor.specialization ILIKE :specialization', {
        specialization: `%${query.specialization}%`
      });
    }

    qb.orderBy('doctor.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, count] = await qb.getManyAndCount();
    return {
      items: items.map((doctor) => this.toDoctorResponse(doctor)),
      meta: { page: query.page, limit: query.limit, count }
    };
  }

  async getPublicDoctor(doctorId: string) {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { id: doctorId },
      relations: ['user']
    });

    if (!doctor || !doctor.user.isActive) {
      throw new NotFoundException('Doctor not found');
    }

    return this.toDoctorResponse(doctor);
  }

  async getMyProfile(userId: string) {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { userId },
      relations: ['user']
    }as any);

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.toDoctorResponse(doctor);
  }

  async updateMyProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { userId },
      relations: ['user']
    } as any);

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    this.assignDoctorPatch(doctor, dto);
    await this.doctorProfilesRepository.save(doctor);

    return this.toDoctorResponse(doctor);
  }

  async deleteMyProfile(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const doctor = await manager.findOne(DoctorProfile, { where: { userId } as any });
      if (!doctor) {
        throw new NotFoundException('Doctor profile not found');
      }

      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = false;
      await manager.save(user);
      await manager.softDelete(DoctorProfile, { id: doctor.id });
      await manager.softDelete(AvailabilitySlot, { doctorId: doctor.id });

      return { deleted: true, doctorId: doctor.id };
    });
  }

  async listPublicSlots(doctorId: string) {
    const slots = await this.slotsRepository.find({
      where: { doctorId, status: SlotStatus.AVAILABLE },
      order: { startTime: 'ASC' }
    }as any);

    return { items: slots, count: slots.length };
  }

  async listConfirmedAppointments(userId: string) {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { userId: Number(userId) } as any
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const appointments = await this.appointmentsRepository.find({
      where: {
        doctorId: doctor.id,
        status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED])
      },
      relations: ['payment', 'patient', 'slot'],
      order: { scheduledAt: 'ASC' }
    }as any);

    const confirmedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        let patientName = 'Unknown';
        let patientEmail = '';

        if (appointment.patientId) {
          const patient = await this.dataSource
            .getRepository(PatientProfile)
            .findOne({
              where: { id: appointment.patientId } as any
            });

          if (patient) {
            const patientUser = await this.usersRepository.findOne({
              where: { id: patient.userId }
            }as any);
            patientName = patient?.fullName || patientUser?.email || 'Unknown';
            patientEmail = patientUser?.email || '';
          }
        }

        return {
          id: appointment.id,
          scheduledAt: appointment.scheduledAt,
          status: appointment.status,
          patientName,
          patientEmail,
          slotTime: appointment.slot?.startTime,
          paymentStatus: appointment.payment?.status,
          amount: appointment.payment?.amount
        };
      })  
    );

    return { items: confirmedAppointments, count: confirmedAppointments.length };
  }

  private assignDoctorPatch(doctor: DoctorProfile, dto: UpdateDoctorProfileDto) {
    if (dto.fullName !== undefined) {
      doctor.fullName = dto.fullName;
    }
    if (dto.specialization !== undefined) {
      doctor.specialization = dto.specialization;
    }
    if (dto.bio !== undefined) {
      doctor.bio = dto.bio;
    }
    if (dto.experienceYears !== undefined) {
      doctor.experienceYears = dto.experienceYears;
    }
    if (dto.consultationFeeCents !== undefined) {
      doctor.consultationFeeCents = dto.consultationFeeCents;
    }
    if (dto.currency !== undefined) {
      doctor.currency = dto.currency;
    }
  }

  private toDoctorResponse(doctor: DoctorProfile) {
    return {
      id: doctor.id,
      userId: doctor.userId,
      email: doctor.user.email,
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      bio: doctor.bio,
      experienceYears: doctor.experienceYears,
      consultationFeeCents: doctor.consultationFeeCents,
      currency: doctor.currency,
      role: Role.DOCTOR,
      isActive: doctor.user.isActive
    };
  }
}
