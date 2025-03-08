import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupllierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;
}
