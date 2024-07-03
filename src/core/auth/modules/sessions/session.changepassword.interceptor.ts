import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';
import { JwtChangePasswordSession } from '@core/auth/jwt-a';
import { Reflector } from '@nestjs/core';
import { CachingService } from '@core/modules/caching';

@Injectable()
export class ChangePasswordInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private cache: CachingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { currentPassword, newPassword, passwordConfirm } = request.body;

    if (!currentPassword || !newPassword || !passwordConfirm) {
      throw new BadRequestException(
        'Password Fields Should Not Be Empty. Input Your Current Password And New Passwords.',
      );
    }

    if (newPassword !== passwordConfirm) {
      throw new BadRequestException('New Passwords Do Not Match. Try Again.');
    }

    return next.handle().pipe(
      map(async () => {
        JwtChangePasswordSession(response);

        return {
          status: 'success',
          message: 'Password Changed Successfully!',
        };
      }),
    );
  }
}
