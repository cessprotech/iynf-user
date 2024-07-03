import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from './modules';
import { JwtVerifyLoginSession } from './jwt-a';
import { CachingService } from '@core/modules/caching';
import { UsersAuthService } from '@app/authentication';

interface CustomRequest extends Request {
  sessionAuth: { [unit: string]: any };
}
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector, private cache: CachingService, private userAuthService: UsersAuthService) {}
  async canActivate(
    context: ExecutionContext,
  ) {
    const is_public = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (is_public) {
      return is_public;
    }

    const request = context.switchToHttp().getRequest<Request>() as CustomRequest;

    const header_token = request.headers.authorization;

    const value = JwtVerifyLoginSession(header_token);

    if (!value.verified || !value.data) throw new UnauthorizedException('You are not authorized! Please Sign in.');

    const token = await this.cache.get(`${value.data.email}-auth-token`);

    if (!token || token !== request.headers.authorization) throw new UnauthorizedException('You are not authorized! Please Sign in.');


    return this.userAuthService
      .userHasResetedPassword(value.data)
      .then((data) => {
        
        request['user'] = value.data;

        return true;
      });
  }
}
