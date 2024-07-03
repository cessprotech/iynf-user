import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsDate,
  MinDate,
  MaxDate,
} from 'class-validator';
import { subYears } from 'date-fns';

/**
 * @class
 * @description User creation document structure  with class-validator validation decorators for additional safety
 * @exports CreateUserDto
 */
export class UserDto {

  @ApiProperty({ description: 'The First Name Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({ description: 'The Last Name Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({ description: 'The Username Should Be Here', required: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly username: string;

  @ApiProperty({ description: 'The dob Should Be Here', required: true })
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => {
    return value && new Date(value)
  })
  @IsDate()
  @MaxDate(subYears(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), 13))
  readonly dob: string;

  @ApiProperty({ description: 'The Country Should Be Here', required: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly country: string;

  @ApiProperty({ description: 'The Nationality Should Be Here', required: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly nationality: string;

  @ApiProperty({ description: 'The Phone Should Be Here', required: true })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly phone: string;

  // @ApiProperty({ description: 'The City Should Be Here', required: true })
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // readonly city: string;

  // @ApiProperty({ description: 'The Currency Should Be Here', required: true })
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // readonly currency: string;

  @ApiProperty({
    description: 'The Terms And Conditions Agreement Should Be Here',
    required: true,
  })
  @IsDefined()
  @IsBoolean()
  @IsOptional()
  readonly termsAndConditionsAgreement: boolean;

  @ApiProperty({
    description: 'The Avatar String Should Be Here',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly avatar: string;

  @ApiProperty({
    description: 'The LinkedIn Url Should Be Here',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly linkedIn: string;

  @ApiProperty({
    description: 'The Twitter Url Should Be Here',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly twitter: string;
}

export type UpdateUserDto = Partial<UserDto> & { avatar?: string, cover?: string };

export class DeleteUserDto { }

export class UploadMediaUrlDto {

  @ApiProperty({
    description: 'The Content String Should Be Here',
    required: false,
  })
  @IsString()
  readonly contentType: string;

  @ApiProperty({
    description: 'The Field Should Be Here',
    required: false,
  })
  @IsString()
  @IsIn(['avatar', 'cover'])
  readonly field: string;

}

export class SaveAvatarDto {

  @ApiProperty({
    description: 'The Avatar String Should Be Here',
    required: false,
  })
  @IsString()
  readonly avatar: string;

}

export class SaveCoverDto {

  @ApiProperty({
    description: 'The Cover String Should Be Here',
    required: false,
  })
  @IsString()
  readonly cover: string;

}
