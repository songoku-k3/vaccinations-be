import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateVaccinationDto {
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
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  certificate?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  remainingQuantity?: number;

  @ApiProperty()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty()
  @IsString()
  manufacturerId?: string;

  @ApiProperty()
  @IsString()
  supplierId?: string;
}
