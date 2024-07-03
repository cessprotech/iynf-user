import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';
import { JwtForgotPassTokenSession } from '@core/auth/jwt-a';
import { SSACustomRequest } from '@core/auth/ss-a';
import { CachingService } from '@core/modules/caching';

@Injectable()
export class ForgotPasswordInterceptor implements NestInterceptor {
  constructor(private cache: CachingService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>() as SSACustomRequest;
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map(async (data) => {
        const token = JwtForgotPassTokenSession(request.body.email, response, data);

        if (token) await this.cache.set({ firstKey: token, value: true, ttl: 10 * 60 });

        return {
          status: 'success',
          message: 'Password Token Sent Successfully!',
          token: data.token
        };
      }),
    );
  }
}
