import { Module } from '@nestjs/common';
// import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from '@core/logger';
import { MessageModule } from '@core/modules/message';
import { MiddlewareModule } from '@core/modules/middleware';
import { CONFIG_VALIDATORS } from '@core/config';
import { APP_ENV } from './app.config';
import { DB_CONNECTION, MODEL_INJECT } from '@core/modules/database';
import { EventEmitModule } from '@core/modules/event-emitter';
import { ShutdownService } from '@core/power.service';
import { CachingModule } from '@core/modules/caching';
import { MicroServicesConfig } from './config.service';
import { AdminModel, NotificationModel, UserModel, WithdrawalModel } from './app.schema';
import { UserAuthSessionModel, UsersAuthController, UsersAuthService } from './authentication';
import { TempUserModel } from './schema/temp.users.schema';
import { MeController } from './authentication/me.controller';
import UserAuthEvents from './authentication/user-auth.events';
import ApiFeatures from './common/ApiFeatures';
import { GoogleAuthService } from './services/google.service';
import { FollowService } from './services/follow.service';
import { FollowModel } from './schema/follow.schema';
import { SentryInterceptor } from '@core/common/interceptors/sentry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminAuthController } from './authentication/admin.controller';
import { AdminAuthService } from './authentication/admin.service';
import { AdminController } from './authentication/admin.auth.controller';
import { AdminService } from './authentication/admin.auth.service';
import { appMController } from './app.m.controller';
import { SendMailService } from './services/email.service';

@Module({
  imports: [
    DB_CONNECTION,

    MODEL_INJECT([UserModel, AdminModel, NotificationModel, WithdrawalModel, UserAuthSessionModel, TempUserModel, FollowModel]),

    EventEmitModule,

    CachingModule,

    LogModule.forRoot(),
    
    ConfigModule.forRoot({
      load: [APP_ENV],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : 'dev.env',
      validationSchema: CONFIG_VALIDATORS,
      cache: true,
      isGlobal: true,
    }),
    
    MiddlewareModule,

    MessageModule,    
    //features
    MicroServicesConfig(),
  ],

  controllers: [AppController, MeController, UsersAuthController, AdminAuthController, AdminController, appMController],

  providers: [AppService, UsersAuthService, AdminAuthService, AdminService, UserAuthEvents, ApiFeatures, GoogleAuthService, FollowService, ShutdownService, SendMailService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ],
})
export class AppModule {}
