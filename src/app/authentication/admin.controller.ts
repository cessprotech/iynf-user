import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,Get,Param,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordSession,
  LoginSession,
  ResetPasswordSession,
  SignupSession,
  SocialSignupSession,
  VerifyForgotPasswordTokenSession,
} from '@core/auth/modules';

import { MessagePattern } from '@nestjs/microservices';
import { JwtVerifyLoginSession } from '@core/auth/jwt-a';
import { CachingService } from '@core/modules/caching';
import { AdminAuthService } from './admin.service';

@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@ApiTags('Admin Authentication')
@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private cache: CachingService,
  ) {}

  @Get(':id')
  async getAdmin(@Param('id') id: string) {   
    return await this.adminAuthService.findAdmin(id);
  }


  @SignupSession()
  @Post('signup')
  async signup(@Body() body: { email: string, password: string}) {
    return await this.adminAuthService.signup(body);
  }

  // @LoginSession()
  @Post('login')
  async login(@Body() body: { email: string, password: string}) {
    const {
      email, password
    } = body;

    const noEmailAndPassword = !email || !password;

    if (noEmailAndPassword) {
      throw new BadRequestException(
        'username and password field should not be empty. Input both username And password.',
      );
    }

    return await this.adminAuthService.login({
      email,
      password,
    });
  }


  @Post('forgot-password')
  @ForgotPasswordSession()
  async forgotPassword(@Body() body: { email: string }) {
    const {
      email ,
    } = body;

    if (!email) {
      throw new BadRequestException(
        'Email Field Should Not Be Empty. Input email To Resest Password',
      );
    }

    return await this.adminAuthService.forgotPasswordToken({
      email,
    });

  }

  @Post('verify-reset-token')
  @VerifyForgotPasswordTokenSession()
  verifyResetPasswordToken() {
    return true;
  }

  @Post('reset-password')
  @ResetPasswordSession()
  async resetPassword(@Body() body: { email: string, password: string }) {
    const {
      email, password,
    } = body;

    const { value, error } = await this.adminAuthService.resetPassword({
      email,
      password,
    });

    if (error) {
      throw new NotFoundException(error.msg);
    }

    return value;
  }

}
