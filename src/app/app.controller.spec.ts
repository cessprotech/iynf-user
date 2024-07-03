import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { LogModule, LogService } from 'src/core/logger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DB_CONNECTION } from 'src/core/modules/database';
import { MessageModule } from 'src/core/modules/message';
import { UsersModule } from '@app/users';
import { CONFIG_VALIDATORS } from 'src/core/config';
import { APP_ENV } from './app.config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        DB_CONNECTION,

        MessageModule,

        ConfigModule.forRoot({
          load: [APP_ENV],
          validationSchema: CONFIG_VALIDATORS,
          cache: true,
          isGlobal: true,
        }),

        WinstonModule.forRootAsync({
          imports: [LogModule],
          useFactory: (loggerService: LogService) => loggerService.initLogger(),
          inject: [LogService],
        }),

        //features
        UsersModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
