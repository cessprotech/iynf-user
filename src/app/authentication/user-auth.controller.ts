import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Get,
  Query,
  Request,
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
import { UserAuth } from './user-auth.constant';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, SignupDto } from './user-auth.dto';

import { UsersAuthService } from './user-auth.service';
import { GoogleAuthService } from '@app/services/google.service';
import { MessagePattern } from '@nestjs/microservices';
import { JwtVerifyLoginSession } from '@core/auth/jwt-a';
import { CachingService } from '@core/modules/caching';
import { QueryOptions } from '@app/common/helpers';

@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@ApiTags('Users Authentication')
@Controller('auth')
export class UsersAuthController {
  constructor(
    private readonly usersAuthService: UsersAuthService,
    private googleService: GoogleAuthService,
    private cache: CachingService,
  ) {}

  @SignupSession()
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return await this.usersAuthService.signup(body);
  }

  @LoginSession()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const {
      email, username, password
    } = body;

    const noUsernameAndPassword = !username || !password;
    const noEmailAndPassword = !email || !password;

    if (noUsernameAndPassword && noEmailAndPassword) {
      throw new BadRequestException(
        'username and password field should not be empty. Input both username And password.',
      );
    }

    return await this.usersAuthService.login({
      email,
      username,
      password,
    });
  }

  @Post('google-login')
  @SocialSignupSession()
  async loginWithThirdParty(@Body('accessToken') accessToken: string, @Body('termsAndConditionsAgreement') taca: boolean) {
    if (!taca) throw new BadRequestException('Please make sure you agree to the terms and conditions before signing up.');

    const user = await this.usersAuthService.loginWithThirdParty(
      'google',
      () => this.googleService.getUser(accessToken)
    );

    return user;
  }

  @Post('forgot-password')
  @ForgotPasswordSession()
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const {
      email ,
    } = body;

    if (!email) {
      throw new BadRequestException(
        'Email Field Should Not Be Empty. Input email To Resest Password',
      );
    }

    return await this.usersAuthService.forgotPasswordToken({
      email,
    });

  }

  @Post('verify-reset-token')
  @VerifyForgotPasswordTokenSession()
  verifyResetPasswordToken() {
    return true;
  }

  @Post('reset-password')
  // @ResetPasswordSession()
  async resetPassword(@Body() body: ResetPasswordDto) {
    const {
      email, password,
    } = body;

    const { value, error } = await this.usersAuthService.resetPassword({
      email,
      password,
    });

    if (error) {
      throw new NotFoundException(error.msg);
    }

    return value;
  }
  
  // save notification
  @Post('notification')
  async saveNotification(@Body() body: any) {
    return await this.usersAuthService.saveNotification(body);
  }
  
  // fetch notification
  @Get('notification')
  async fetchNotification(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);
        
    return await this.usersAuthService.findAll(otherQuery, paginateOptions);
  }



  @MessagePattern({ cmd: 'USER_AUTH' })
  async MSAuth(data: { token: string }) {

    try {
      const value = JwtVerifyLoginSession(data.token);

      if (!value.verified || !value.data) throw new UnauthorizedException('You are not authorized! Please Sign in.');
  
      const token = await this.cache.get(`${value.data.email}-auth-token`);
  
      if (!token || token !== data.token) throw new UnauthorizedException('You are not authorized! Please Sign in.');
      
      const user = await this.usersAuthService.userHasResetedPassword(value.data);

      // if (user.isNewUser) throw new ForbiddenException('Please complete your profile to perform this action.')

      return {
        status: true,
        data: user,
        error: null
      }
    } catch (error) {
      return { 
        status: false,
        data: null,
        error: error.message
      }
    }
    
  }

}
