import { Connection, Model, PaginateModel, PaginateOptions } from 'mongoose';
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { LogService, Logger } from '@core/logger';
import { Follow } from '@app/schema/follow.schema';
import { User } from '@app/app.schema';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from '@app/app.constants';

interface PopulateInterface {
    path: string;
    match?: Record<string, unknown>;
    options?: Record<string, unknown>;
}

type PopulateOptions = PopulateInterface[] | undefined;



@Injectable()
export class FollowService {

  @Logger(FollowService.name) private readonly logger: LogService;
  
  constructor(
    @InjectConnection() private readonly connection: Connection,
    
    @InjectModel(User.name) private readonly userModel: Model<User> & PaginateModel<User>,

    @InjectModel(Follow.name) private readonly followModel: Model<Follow> & PaginateModel<Follow>,

    @Inject(APP_CONFIG.NOTIFICATION_SERVICE) private readonly notificationClient: ClientProxy,
  ) {}

  async getAllFollows(query?: Record<string, any>, paginateOptions: PaginateOptions = {}) {
    const {page, limit, select, sort, ...rest} = query;

    return await this.followModel.paginate(rest, paginateOptions);
  }
  
  async isFollowing(followerId: string, userId: string) {
    let following = await this.followModel.findOne({ userId, followerId });

    if (!following) return { following: false };

    return { following: true };
  }
  
  async follow(followerId: string, userId: string) {
    let followed = await this.followModel.findOne({ userId, followerId });

    if (followed) return followed;

    const session = await this.connection.startSession();

    session.startTransaction();

    try {

      [followed] = await this.followModel.create([{ userId, followerId }], { session });

      await this.userModel.findOneAndUpdate({ userId: followed.userId }, { $inc: { followers: 1 } }, { session });
      
      const follower = await this.userModel.findOneAndUpdate({ userId: followed.followerId }, { $inc: { following: 1 } }, { session });

      await session.commitTransaction();
      session.endSession();

      const notificationExist = await this.connection.collection('notifications').findOne({ 
        key: 'follows', userId, profileId: followerId
      });

      if (!notificationExist) {
        firstValueFrom(
          this.notificationClient.emit({ cmd: 'NEW_NOTIFICATION' }, {
            data: {
              type: 'profile',
              userId,
              profileId: followerId,
              canDelete: true
            },
            notifyParams: {
              notifyName: 'follows',
              name: `${follower.firstName} ${follower.lastName}`
            }
          }),
        );
      }

      

      return followed.toObject();

    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error.message);
      this.logger.error(error.message, error.stack);
      if (error.message.includes('collection') || error.message.includes('iynfluencer')) throw error;

      throw new InternalServerErrorException('Error occured while trying to follow this user! Try again later.');
    }
 
  }
  
  async unfollow(followerId: string, userId: string) {
    let followed = await this.followModel.findOne({ userId, followerId });

    if (!followed) return null;

    const session = await this.connection.startSession();

    session.startTransaction();

    try {

      await this.userModel.findOneAndUpdate({ userId: followed.userId }, { $inc: { followers: -1 } }, { session });
      
      await this.userModel.findOneAndUpdate({ userId: followed.followerId }, { $inc: { following: -1 } }, { session });

      await this.followModel.findOneAndDelete({ userId, followerId });

      await session.commitTransaction();
      session.endSession();

      return null;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error.message);
      this.logger.error(error.message, error.stack);
      if (error.message.includes('collection') || error.message.includes('iynfluencer')) throw error;

      throw new InternalServerErrorException('Error occured while trying to unfollow this user! Try again later.');
    }
 
  }
  
  
}
