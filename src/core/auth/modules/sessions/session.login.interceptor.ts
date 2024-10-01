import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';
import { APP_CONFIG } from '@app/app.constants';
import { JwtLoginSession } from '@core/auth/jwt-a';
import { SSACustomRequest, SsaLoginSession } from '@core/auth/ss-a';
import { Reflector } from '@nestjs/core';
import { CachingService } from '@core/modules/caching';
@Injectable()
export class LoginSessionInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector, 
    private cache: CachingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>() as SSACustomRequest;
    const response = context.switchToHttp().getResponse<Response>();


    return next.handle().pipe(
      map(async(data) => {
        request['user'] = data;

        const token = JwtLoginSession(response, data);

        if (token) await this.cache.set({ firstKey: `${data.email}-auth-token`, value: token, ttl: 2 * 60 * 60 });

        return {
          status: 'success',
          message: 'Logged In Successfully!',
        };
        
      }),
    );
  }
}
