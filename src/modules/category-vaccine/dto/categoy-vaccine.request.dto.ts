import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryVaccineDto {
  @ApiProperty({
    description: 'Tên loại vắc xin',
    example: 'Vắc xin phòng bệnh dại',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mô tả loại vắc xin',
    example: 'Vắc xin phòng bệnh dại',
  })
  @IsString()
  @IsOptional()
  description: string;
}

export class UpdateCategoryVaccineDto extends PartialType(
  CreateCategoryVaccineDto,
) {}
