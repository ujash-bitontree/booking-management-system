import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePatientAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
