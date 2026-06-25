import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  experienceYears?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  consultationFeeCents?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
