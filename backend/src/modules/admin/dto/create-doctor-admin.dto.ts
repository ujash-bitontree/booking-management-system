import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDoctorAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

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
