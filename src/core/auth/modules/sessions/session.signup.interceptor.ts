import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { map, Observable } from 'rxjs';
  import { Request, Response } from 'express';
  import { JwtLoginSession } from '@core/auth/jwt-a';
  import { Reflector } from '@nestjs/core';
  import { CachingService } from '@core/modules/caching';
  @Injectable()
  export class SignupSessionInterceptor implements NestInterceptor {
    constructor(
      private reflector: Reflector, 
      private cache: CachingService,
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

      const response = context.switchToHttp().getResponse<Response>();
  
      return next.handle().pipe(
        map(async(data) => {
          const token = JwtLoginSession(response, data);

          if (token) await this.cache.set({ firstKey: `${data.email}-auth-token`, value: token, ttl: 2 * 60 * 60 });
  
          // request[protectClass] = data;
          
          let message = 'Profile Created Successfully.';

          if (data.isNewUser) message = 'Registration Successful!';

          delete data.socialId;

          return {
            status: 'success',
            message,
            data
          };
          
        }),
      );
    }
  }
  