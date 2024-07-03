import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from '@app/index';
import { Request, Response } from 'express';
import * as crypto from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import {
  BadRequestException,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { CachingService } from '@core/modules/caching';

const configService = new ConfigService();

const jwt_header_name = 'Authorization';

interface LoginTokenInterface extends jwt.JwtPayload {
  [key: string]: any;
}

interface ForgotPassTokenInterface extends jwt.JwtPayload {
  email: string;
  token: string;
}

interface ResetPasswordInterface extends jwt.JwtPayload {
  email: string;
}

export const JwtLoginSession = (
  response: Response,
  data: Record<string, unknown>,
) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET);

  const jwt_expires = configService.get(APP_CONFIG.JWT_EXPIRES);

  const jwtData = {
    ...data,
  };

  const encrypted = crypto.AES.encrypt(JSON.stringify(jwtData), jwt_secret).toString();

  const token = jwt.sign({ data: encrypted }, jwt_secret, { expiresIn: jwt_expires });

  response.setHeader(jwt_header_name, token);

  return token;
};

export const JwtVerifyLoginSession = (
  token: string,
) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET);

  if (!token) {
    throw new UnauthorizedException('You are not authorized! Please Sign in.');
  }

  try {
    const decoded = jwt.verify(token, jwt_secret) as LoginTokenInterface;

    let bytes = crypto.AES.decrypt(decoded.data, jwt_secret);
    let decrypted = JSON.parse(bytes.toString(crypto.enc.Utf8));

    return { verified: true, data: decrypted };
  } catch (err) {
    if (err.message.includes('expired')) {
      throw new UnauthorizedException('Token Expired! Please Sign in.');
    }
    if (err.message.includes('invalid')) {
      throw new UnauthorizedException('Invalid Token! Please Sign in.');
    }
    return { verified: false };
  }
};

export const JwtForgotPassTokenSession = (
  email: string,
  response: Response,
  value: Record<string, any>,
) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET);

  const jwt_expires = '10m';

  const { token: email_token } = value;

  const encrypted = crypto.AES.encrypt(JSON.stringify({ email, token: email_token }), jwt_secret).toString();

  const token = jwt.sign(
    { data: encrypted },
    jwt_secret,
    { expiresIn: jwt_expires },
  );

  response.setHeader(jwt_header_name, token);

  return token;
};

export const JwtVerifyForgotPassTokenSession = (
  request: Request,
  response: Response,
) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET);

  const header_token = request.header(jwt_header_name);

  const password_token = +request.body.token;

  if (!header_token) {
    throw new BadRequestException(
      'Reset Password Session Expired. Send A New Token To Your Mail.',
    );
  }

  try {
    const decoded = jwt.verify(
      header_token,
      jwt_secret,
    ) as ForgotPassTokenInterface;

    let bytes = crypto.AES.decrypt(decoded.data, jwt_secret);

    let decrypted = JSON.parse(bytes.toString(crypto.enc.Utf8));

    if (+decrypted.token !== password_token) {
      throw new NotAcceptableException('Invalid Token. Try Again!');
    }

    const jwt_expires = '10m';

    const encrypted = crypto.AES.encrypt(JSON.stringify({ email: decrypted.email }), jwt_secret).toString();

    const token = jwt.sign({ data: encrypted }, jwt_secret, {
      expiresIn: jwt_expires,
    });

    response.setHeader(jwt_header_name, token);

    return token;
  } catch (err) {
    console.log(err.message);
    if (err.message.includes('expired')) {
      throw new UnauthorizedException('Token Has Expired! Please Send A New Token To Your Mail.');
    }
    
    if (err.message.includes('invalid')) {
      throw new UnauthorizedException('Token Is Invalid! Please Send A New Token To Your Mail.');
    }

    throw err;
  }
};

export const JwtResetPasswordSession = (request: Request) => {
  const jwt_secret = configService.get(APP_CONFIG.JWT_SECRET);

  const header_token = request.header(jwt_header_name);

  if (!header_token) {
    throw new BadRequestException(
      'Reset Password Session Expired. Send A New Token To Your Mail.',
    );
  }

  try {
    const decoded = jwt.verify(
      header_token,
      jwt_secret,
    ) as ResetPasswordInterface;

    let bytes = crypto.AES.decrypt(decoded.data, jwt_secret);

    let decrypted = JSON.parse(bytes.toString(crypto.enc.Utf8));
    request.body.email = decrypted.email;

    delete request.body.passwordConfirm;
    
  } catch (err) {
    if (err.message.includes('expired')) {
      throw new UnauthorizedException('Token Has Expired! Please Try Again.');
    }

    throw err;
  }
};

export const JwtChangePasswordSession = (response: Response) => {
  response.setHeader(jwt_header_name, '');
};
