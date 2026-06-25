import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber()
  @Type(() => Number)
  doctorId!: number;

  @IsNumber()
  @Type(() => Number)
  slotId!: number;

  @IsDateString()
  scheduledAt!: string;
}
