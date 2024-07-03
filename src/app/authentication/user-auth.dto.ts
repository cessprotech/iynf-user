import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  IsEmail,
  MinLength,
  IsDate,
  IsDefined,
  IsBoolean,
  IsOptional,
  IsIn,
} from 'class-validator';

/**
 * @class
 * @description User-Auth creation document structure  with class-validator validation decorators for additional safety
 * @exports LoginDto
 */

export class SignupDto {

  @ApiProperty({ description: 'The First Name Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({ description: 'The Last Name Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;
  
  @ApiProperty({ description: 'The Country Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @ApiProperty({ description: 'The Email Address Should Be Here', required: true })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'The Password Should Be Here', required: true })
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;

  @IsDefined()
  @IsBoolean()
  @IsIn([true])
  readonly termsAndConditionsAgreement: boolean;
}

export class LoginDto {

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly password: string;
}

export class ForgotPasswordDto {

  @IsEmail()
  readonly email: string;
}

export class ResetPasswordDto {

  @IsEmail()
  readonly email: string;


  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly password: string;
}

export class ChangePasswordDto {

  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly currentPassword: string;

  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly newPassword: string;

  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly passwordConfirm: string;
}

export const LOGIN_FIELDS = ['email'];
