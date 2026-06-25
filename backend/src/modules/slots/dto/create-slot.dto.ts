import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateSlotDto {
  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
