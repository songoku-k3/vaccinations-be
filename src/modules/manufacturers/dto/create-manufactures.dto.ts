import { IsNotEmpty, IsString } from 'class-validator';

export class CreateManufacturesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;
}
