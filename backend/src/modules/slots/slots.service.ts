import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilitySlot, SlotStatus } from './entities/availability-slot.entity';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly slotsRepository: Repository<AvailabilitySlot>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfilesRepository: Repository<DoctorProfile>
  ) {}

  async createDoctorSlot(userId: string, dto: CreateSlotDto) {
    const doctor = await this.findDoctorByUserId(userId);
    const slot: any = this.slotsRepository.create({
      doctorId: doctor.id,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      capacity: dto.capacity ?? 1,
      status: SlotStatus.AVAILABLE
    } as any);

    this.validateTimeRange(slot.startTime, slot.endTime);

    try {
      return await this.slotsRepository.save(slot);
    } catch {
      throw new ConflictException('Slot already exists for the selected time range');
    }
  }

  async updateDoctorSlot(userId: string, slotId: string, dto: UpdateSlotDto) {
    const doctor = await this.findDoctorByUserId(userId);
    const slot = await this.slotsRepository.findOne({
      where: { id: slotId, doctorId: doctor.id }
    }as any);

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (dto.startTime) {
      slot.startTime = new Date(dto.startTime);
    }

    if (dto.endTime) {
      slot.endTime = new Date(dto.endTime);
    }

    if (slot.startTime && slot.endTime) {
      this.validateTimeRange(slot.startTime, slot.endTime);
    }

    if (dto.capacity !== undefined) {
      slot.capacity = dto.capacity;
    }

    if (dto.status) {
      slot.status = dto.status;
    }

    return this.slotsRepository.save(slot);
  }

  async deleteDoctorSlot(userId: string, slotId: string) {
    const doctor = await this.findDoctorByUserId(userId);
    const result = await this.slotsRepository.softDelete({
      id: slotId,
      doctorId: doctor.id
    }as any);

    if (!result.affected) {
      throw new NotFoundException('Slot not found');
    }

    return { deleted: true, slotId };
  }

  async listDoctorSlots(userId: string) {
    const doctor = await this.findDoctorByUserId(userId);
    const slots = await this.slotsRepository.find({
      where: { doctorId: doctor.id },
      order: { startTime: 'ASC' }
    }as any);

    return { items: slots, count: slots.length };
  }

  async listPublicDoctorSlots(doctorId: string) {
    const slots = await this.slotsRepository.find({
      where: { doctorId, status: SlotStatus.AVAILABLE },
      order: { startTime: 'ASC' }
    }as any);

    return { items: slots, count: slots.length };
  }

  private async findDoctorByUserId(userId: string): Promise<DoctorProfile> {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { userId }
    }as any);

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
  }

  private validateTimeRange(startTime: Date, endTime: Date) {
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid slot time range');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('Slot end time must be after start time');
    }
  }
}
