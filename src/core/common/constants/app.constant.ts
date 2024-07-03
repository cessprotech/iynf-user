import { ConfigService } from "@nestjs/config";

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
};

export const ENV_VARS = {
  NODE_ENV: process.env.NODE_ENV,
};

export const STATUS = {
  SUCCESS: 'success',

  FAILED: 'failed',

  ERROR: 'error',
};

export const PROVIDERS = {
  DB_CONNECT: 'DB_CONNECT',
  MessageService: 'MessageService',
  CachingService: 'CachingService',
};

export const CONFIG = {
  DATABASE: 'database',

  HOST: 'HOST',

  PORT: 'PORT',
};

export const TYPES = {
  STRING: 'string',
};

export const REQUEST_METHODS = {
  GET: 'GET',

  POST: 'POST',

  PUT: 'PUT',

  PATCH: 'PATCH',

  DELETE: 'DELETE',
};

export const TAGS = {
  DEFAULT: 'App',
};

export const configService = new ConfigService();
