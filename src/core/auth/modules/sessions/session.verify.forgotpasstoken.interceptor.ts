import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';
import { APP_CONFIG } from '@app/app.constants';
import { JwtVerifyForgotPassTokenSession } from '@core/auth/jwt-a';
import { SSACustomRequest, SsaVerifyForgotPassTokenSession } from '@core/auth/ss-a';
import { configService } from '@core/common/constants';
import { CachingService } from '@core/modules/caching';

@Injectable()
export class VerifyForgotPasswordTokenInterceptor implements NestInterceptor {
  constructor(private cache: CachingService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>() as SSACustomRequest;
    const response = context.switchToHttp().getResponse<Response>();

    const old_auth_token = request.headers.authorization;
    
    const password_token = +request.body.token;

    if (!password_token) {
      throw new BadRequestException(
        'Token Field Should Not Be Empty. Input Token From Your Email To Resest Password',
      );
    }

    if (!(await this.cache.get(old_auth_token))) throw new UnauthorizedException('Reset Password Session Expired. Send A New Token To Your Mail.');
      
    const new_auth_token = JwtVerifyForgotPassTokenSession(request, response);

    if (new_auth_token) await this.cache.set({ firstKey: new_auth_token, value: true, ttl: 10 * 60 });

    return next.handle().pipe(
      map(async () => {
        await this.cache.del(old_auth_token);

        return {
          status: 'success',
          message: 'Resest Password Token Verified Successfully!',
        };
      }),
    );
  }
}
