import { Injectable } from '@nestjs/common';
import { InjectConfigValidation } from '@core/config';
import * as Joi from 'joi';

@Injectable()
export class AppEnvClass {
  APP_NAME = Joi.string().required();
  APP_VERSION = Joi.string().required();
  APP_DESCRIPTION = Joi.string().required();

  DOCS_ROUTE = Joi.string().required();

  SENTRY_DSN = Joi.string();

  HOST = Joi.string().default('http://localhost');
  PORT = Joi.number().default(5040);

  RMQ_URI = Joi.string().required();

  REDIS_CLOUD = Joi.string().required();

  RMQ_USER_QUEUE = Joi.string().required();

  NODE_ENV = Joi.string().equal('production', 'development').required();

  MONGO_STORE_SECRET = Joi.string().required();
  MONGO_STORE_TTL = Joi.number().required();

  EXPRESS_SESSION_SECRET = Joi.string().required();
  EXPRESS_SESSION_NAME = Joi.string().required();
  EXPRESS_COOKIE_MAX_AGE = Joi.number().required();

  JWT_SECRET = Joi.string().required();
  JWT_EXPIRES = Joi.string().default('4y');

  GOOGLE_APP_ID = Joi.string();
  GOOGLE_APP_SECRET = Joi.string();

  CREATOR_SERVICE = Joi.string().default('CREATOR_SERVICE');
  RMQ_CREATOR_QUEUE = Joi.string().required();

  INFLUENCER_SERVICE = Joi.string().default('INFLUENCER_SERVICE');
  RMQ_INFLUENCER_QUEUE = Joi.string().required();

  NOTIFICATION_SERVICE = Joi.string().default('NOTIFICATION_SERVICE');
  RMQ_NOTIFICATION_QUEUE = Joi.string().required();

  MAILER_SERVICE = Joi.string().default('MAIL_SERVICE');
  RMQ_MAILER_QUEUE = Joi.string().required();

  AWS_REGION = Joi.string();
  AWS_ACCESS_KEY_ID = Joi.string();
  AWS_ACCESS_KEY_SECRET = Joi.string();
  AWS_BUCKET_NAME = Joi.string();

  CLOUD_API = Joi.string();
  CLOUD_NAME = Joi.string();
  CLOUD_SECRET = Joi.string();

  EMAIL_HOST = Joi.string();
  EMAIL_PASS = Joi.string();
  EMAIL_PORT = Joi.string();
  EMAIL_USER = Joi.string();

  // EXPERIENCE_SERVICE = Joi.string().default('llll');
}

export const APP_ENV = InjectConfigValidation<AppEnvClass>(
  'app',
  new AppEnvClass(),
);
