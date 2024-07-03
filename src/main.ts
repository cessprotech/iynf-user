import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { AppModule } from './app';
import { HttpExceptionFilter } from '@core/common/filters';
import { VALIDATION_RULE } from '@core/common/constants';
import { APP_CONFIG } from './app/app.constants';
import { LogService } from '@core/logger';
import { Error } from 'mongoose';
import { ShutdownService } from '@core/power.service';
import { sessionParams } from '@core/auth/common';
import { corsOptions } from '@core/auth/common/modules';
import { Transport } from '@nestjs/microservices';
import * as Sentry from '@sentry/node';

/**
 * @desc - Starts the application, assembly point of all the modules
 */
async function bootstrap() {
  //application execution port

  //logger instance  - No dependency injection
  const logger = new LogService();

  //Nest application artifect creation
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Global Prefix
  app.setGlobalPrefix('/api/v1/users');

  //fetching config service to get env variables
  const config_service = new ConfigService();

  const HOST = config_service.get<string>(APP_CONFIG.HOST);

  const PORT = config_service.get<number>(APP_CONFIG.PORT);

  const SENTRY_DSN = config_service.get<string>(APP_CONFIG.SENTRY_DSN);

  const APP_NAME = config_service.get<string>(APP_CONFIG.APP_NAME);

  const APP_VERSION = config_service.get<string>(APP_CONFIG.APP_VERSION);

  const DOCS_ROUTE = config_service.get<string>(APP_CONFIG.DOCS_ROUTE);

  const APP_DESCRIPTION = config_service.get<string>(
    APP_CONFIG.APP_DESCRIPTION,
  );

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN
    });
  }

  app.connectMicroservice({
    transport: Transport.RMQ,
      options: {
        urls: [`${config_service.get(APP_CONFIG.RMQ_URI)}`],
        queue: `${config_service.get(APP_CONFIG.RMQ_USER_QUEUE)}`,
        queueOptions: { durable: false },
        persistent: true
      }
  });

  //applying global pipe to application
  app.useGlobalPipes(new ValidationPipe(VALIDATION_RULE));

  //using global filters - exception handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // enable cors
  app.enableCors(corsOptions);

  // enable sessions
  app.use(session(sessionParams()));

  //TODO: move options to config module and refactor
  //configure docs builder options
  const options = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(DOCS_ROUTE, app, document);

  //log messages on application init
  logger.log(`ℹℹℹ LISTENING TO SERVER ${HOST}:${PORT} ℹℹℹ`);

  //log authentication type
  logger.log(`ℹℹℹ AUTHENTICATION TYPE(JWT | SSA): JWT ℹℹℹ`);

  //getting the application shutdown service
  const power = app.get(ShutdownService);

  // Subscribe to your service's shutdown event, run app.close() when emitted
  power.prepareToShutdown(async () => await app.close());

  //start microservice
  await app.startAllMicroservices();

  //listen to port for requests
  await app.listen(PORT);

  //handling uncaughtExceptions
  process.on('uncaughtException', (err: Error) => {
    power.handleExceptions(err);
  });

  //handling unhandledRejection
  process.on('unhandledRejection', (err: Error) => {
    power.handleRejections(err);
  });
  
}

//run
bootstrap();
