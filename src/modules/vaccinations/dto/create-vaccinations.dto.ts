import { IsString, IsOptional, IsInt, IsDate } from 'class-validator';

export class CreateVaccinationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  vaccineName: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsDate()
  vaccinationDate?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  certificate?: string;

  @IsOptional()
  @IsInt()
  remainingQuantity?: number;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsDate()
  expirationDate?: Date;

  @IsOptional()
  @IsString()
  manufacturerId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;
}
