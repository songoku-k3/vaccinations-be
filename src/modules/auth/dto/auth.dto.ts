import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/, {
    message:
      'Mật khẩu phải chứa ít nhất một chữ hoa, một số, một kí tự đặc biệt',
  })
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/, {
    message:
      'Mật khẩu phải chứa ít nhất một chữ hoa, một số, một kí tự đặc biệt',
  })
  confirm_password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  current_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/, {
    message:
      'Mật khẩu phải chứa ít nhất một chữ hoa, một số, một kí tự đặc biệt',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/, {
    message:
      'Mật khẩu phải chứa ít nhất một chữ hoa, một số, một kí tự đặc biệt',
  })
  confirm_password: string;
}
