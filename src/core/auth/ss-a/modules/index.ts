import {
  BadRequestException,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { APP_CONFIG } from 'src/app/app.constants';

export interface SSACustomRequest extends Request {
  sessionAuth: { [unit: string]: any };
}

const configService = new ConfigService();

const default_jwt_secret = 'Please-include a secret in the .env';

interface ForgotPassTokenInterface extends jwt.JwtPayload {
  email: string;
  token: string;
}

interface ResetPasswordInterface extends jwt.JwtPayload {
  email: string;
}

export const SsaLoginSession = (request: SSACustomRequest, data: Record<string, unknown>, authClass: string) => {
  request.sessionAuth = {
    type: 'ssa',
    data,
    class: authClass,
  };
};

export const VerifySsaLoginSession = (
  request: SSACustomRequest,
  protectClass: string,
) => {
  const { sessionAuth: auth } = request;

  if (!auth) {
    throw new UnauthorizedException('You are not authorized! Please Log In.');
  }

  if (protectClass !== auth.class) {
    return { verified: false };
  }

  return {
    verified: true,
    data: auth.data,
  };
};

export const SsaForgotPassTokenSession = (
  request: SSACustomRequest,
  response: Response,
  value: Record<string, any>,
) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET) || default_jwt_secret;

  const jwt_expires = configService.get(APP_CONFIG.JWT_EXPIRES) || '10m';

  const { token: email_token } = value;

  const token = jwt.sign(
    { email: request.body.email, token: email_token },
    jwt_secret,
    { expiresIn: jwt_expires },
  );

  request.sessionAuth = {
    email: request.body.email,
    token,
  };
};

export const SsaVerifyForgotPassTokenSession = (request: SSACustomRequest) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET) || default_jwt_secret;

  const {
    sessionAuth: { token: session_token, email } = {
      token: undefined,
      email: undefined,
    },
  } = request;

  const password_token = +request.body.token;

  if (!session_token) {
    throw new BadRequestException(
      'Reset Password Session Expired. Please Send A New Token To Your Mail.',
    );
  }

  try {
    const decoded = jwt.verify(
      session_token,
      jwt_secret,
    ) as ForgotPassTokenInterface;

    if (+decoded.token !== password_token) {
      throw new NotAcceptableException('Invalid Token. Please Try Again!');
    }

    const jwt_expires = configService.get(APP_CONFIG.JWT_EXPIRES) || '15m';

    const token = jwt.sign({ email }, jwt_secret, {
      expiresIn: jwt_expires,
    });

    request.sessionAuth = {
      email,
      token,
    };
  } catch (err) {
    if (err.message.includes('expired')) {
      throw new UnauthorizedException('Token Has Expired! Please Send A New Token To Your Mail.');
    }

    throw err;
  }
};

export const SsaResetPasswordSession = (request: SSACustomRequest) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET) || default_jwt_secret;

  const { sessionAuth: { token: session_token } = { token: undefined } } =
    request;

  if (!session_token) {
    throw new BadRequestException(
      'Reset Password Session Expired. Please Send A New Token To Your Mail.',
    );
  }

  try {
    const decoded = jwt.verify(
      session_token,
      jwt_secret,
    ) as ResetPasswordInterface;

    request.body.email = decoded.email;

    request.session.destroy((err) => {
      throw err;
    });
  } catch (err) {
    if (err.message.includes('expired')) {
      throw new UnauthorizedException('Token Has Expired! Please Send A New Token To Your Mail.');
    }

    throw err;
  }
};
export const SsaChangePasswordSession = (request: Request) => {
  request.session.destroy((err) => {
    throw err;
  });
};
