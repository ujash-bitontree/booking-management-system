import { IsOptional, IsString } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
