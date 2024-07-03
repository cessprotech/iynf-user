import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import { APP_CONFIG } from '@app/app.constants';
import { JwtResetPasswordSession } from '@core/auth/jwt-a';
import { SSACustomRequest, SsaResetPasswordSession } from '@core/auth/ss-a';
import { configService } from '@core/common/constants';
import { CachingService } from '@core/modules/caching';

@Injectable()
export class ResetPasswordInterceptor implements NestInterceptor {
  constructor(private cache: CachingService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>() as SSACustomRequest;

    const old_auth_token = request.headers.authorization;

    const { password, passwordConfirm } = request.body;

    if (!(await this.cache.get(old_auth_token))) throw new UnauthorizedException('Reset Password Session Expired. Send A New Token To Your Mail.');

    JwtResetPasswordSession(request);

    if (!password || !passwordConfirm) throw new BadRequestException(
        'Password Fields Should Not Be Empty. Input Your New Passwords.',
      );

    if (password !== passwordConfirm) throw new BadRequestException('Passwords Do Not Match. Try Again.');

    return next.handle().pipe(
      map(async () => {

        await this.cache.del(old_auth_token);

        return {
          status: 'success',
          message: 'Password Reseted Successfully! Please Log In.',
        };
      }),
    );
  }
}
