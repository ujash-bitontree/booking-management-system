import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SlotStatus } from '../entities/availability-slot.entity';

export class UpdateSlotDto {
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}
