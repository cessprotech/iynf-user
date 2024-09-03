import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, PaginateModel, Connection } from 'mongoose';
import { AdminModelName, Admin } from '@app/app.schema';
import { UserAuth, UserAuthSessionInterface, USER_AUTH_EVENTS } from './user-auth.constant';
// import { UserAuthSessionModelName, User_Auth_Session } from './user-auth.schema';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogService, Logger } from '@core/logger';
import { APP_CONFIG } from '@app/app.constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SendMailService } from '@app/services/email.service';



@Injectable()
export class AdminAuthService {

  @Logger(AdminAuthService.name) private readonly logger: LogService;
  constructor(

    @InjectConnection() private readonly connection: Connection,

    @InjectModel(AdminModelName) public readonly adminModel: Model<Admin>,

    // @InjectModel(UserAuthSessionModelName)
    // private readonly userAuthSessionModel: Model<User_Auth_Session> & PaginateModel<User_Auth_Session>,
    
    // @Inject(APP_CONFIG.MAILER_SERVICE) private readonly mailClient: ClientProxy,

    // private eventEmitter: EventEmitter2,

    private readonly sendMailService: SendMailService

  ) {}

  async signup(adminCdt: { email: string, password: string}) {

    try {
      const admin =  await this.adminModel.create(adminCdt);     

      return { message: 'success', admin }

    } catch (error) {

      console.log(error.message);
      this.logger.error(error.message, error.stack);
      if (error.message.includes('collection') || error.message.includes('iynfluencer')) throw error;

      throw new InternalServerErrorException('User cannot be created now! Try again later.');
    }
    
  }

  async findAdmin(id: string) {
    const admin = await this.adminModel.findOne({ _id: id });

    if (!admin) throw new NotFoundException('Invalid id. Admin Does Not Exist!');
    
    return { message: 'success', admin }
  }


  async login(adminCdt: { email: string, password: string}) {
    const admin = await this.adminModel.findOne({ email: adminCdt.email });

    if (!admin || !(await admin.validatePassword(adminCdt.password))) {
      throw new NotFoundException('Invalid email or password!');
    }

    return { message: 'success', admin }
  }

  

  async forgotPasswordToken(adminDta: { email: string }) {
    const admin = await this.adminModel
      .findOne({ email: adminDta.email })

    if (!admin) throw new NotFoundException('Invalid Email. Admin Does Not Exist!');

    const token = Math.round(Math.random() * 900000 + 100000);

    this.sendMailService.sendForgotMail(adminDta.email, `Admin`, token)

    return { token };
  }

  async resetPassword(adminCdt: { email: string, password: string }) {
    const admin = await this.adminModel.findOne({ email: adminCdt.email });

    if (!admin) {
      return {
        error: {
          msg: 'Invalid Email. Email Address Does Not Exist!',
        },
      };
    }

    admin.password = adminCdt.password;

    admin.save({ validateModifiedOnly: true, validateBeforeSave: false });


    return { value: { data: admin } };
  }
}
