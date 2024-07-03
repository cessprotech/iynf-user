import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LogService, Logger } from '@core/logger';
import { E_RESPONSE } from '@core/modules/message';
import { sendVerificationMail } from './user-auth.interface';
import { USER_AUTH_EVENTS } from './user-auth.constant';

@Injectable()
export default class UserAuthEvents {
  @Logger(UserAuthEvents.name) private readonly logger: LogService;

  constructor() {}
  @OnEvent(USER_AUTH_EVENTS.CREATE)
  sendUserVerificationMail(data: sendVerificationMail) {
    // handle and process "UserCreatedEvent" event
    // this.mailService.sendVerification(data);
  }

  // ...other handlers goes here
}
