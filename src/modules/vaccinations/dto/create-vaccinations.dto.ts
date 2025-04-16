import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVaccinationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vaccineName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  certificate?: string;

  @IsOptional()
  @IsInt()
  remainingQuantity?: number;

  @ApiProperty()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  manufacturerId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  supplierId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  categoryVaccinationId?: string;
}
