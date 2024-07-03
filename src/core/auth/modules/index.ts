import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../authentication.guard';

export * from './sessions';

export const PUBLIC_KEY = 'IS_PUBLIC';

export interface CustomRequest extends Request {
  sessionAuth: { [unit: string]: any };
  user: any;
}

// eslint-disable-next-line @typescript-eslint/ban-types

export const Protect = () => {
  return applyDecorators(
    UseGuards(AuthenticationGuard),
  );
};

export const Public = () => SetMetadata(PUBLIC_KEY, true);
