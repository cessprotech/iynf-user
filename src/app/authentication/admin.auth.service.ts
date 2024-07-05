import { FilterQuery, Model, PaginateModel, PaginateOptions, startSession } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from '../app.dto';
import { User } from '../app.schema';
import { UserAuthSessionInterface, User_Auth_Session } from '@app/authentication';
import { AgeAndAbove, generateUsername } from '@app/common/helpers';
import { TempUser, TempUserModelName } from '../schema/temp.users.schema';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from '../app.constants';
// import { CachingService } from '@libs/modules/caching';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User> & PaginateModel<User>,

    @InjectModel(TempUserModelName) public readonly tempUserModel: Model<TempUser>,

    @InjectModel(User_Auth_Session.name)
    private readonly userAuthSessionModel: Model<User_Auth_Session> & PaginateModel<User>,
    
    @Inject(APP_CONFIG.NOTIFICATION_SERVICE) private readonly notificationClient: ClientProxy,
  ) {}

  async findAll(query: Record<string, any>, paginateOptions: PaginateOptions = {}) {
    const {page, limit, select, sort, ...rest} = query;

    let users = await this.userModel.paginate(rest, paginateOptions);
    const totalUsers = await this.userModel.countDocuments();

    return {
        'totalAmount': totalUsers,
        'paginatedUsers': users
    };

  }


  async getOne(id: string) {
    
    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    // const date = new Date(user.dob);

    // const options: any = {
    //   weekday: "short",
    //   month: "short",
    //   day: "2-digit",
    //   year: "numeric"
    // };

    // const formattedDate = date.toLocaleDateString("en-US", options);

    // user.dob = formattedDate

    return user;
  }


  async searchBy(search: { keyword: string }) {
    const users = await this.userModel.find({
      $or: [
        { firstName: { $regex: search.keyword, $options: 'i' } },
        { lastName: { $regex: search.keyword, $options: 'i' } }
      ]
    }).limit(10)
  
    if (users.length === 0) {
       return false;
    }
  
    return users;
  }


  async blockAndUnblockUser(id: string, updateUserDto: { active: boolean }) {
    const user = await this.getOne(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return await this.userModel.findOneAndUpdate(
      { _id: id },
      { active: updateUserDto.active }
    ,{
      new: true,
      runValidators: true
    });
  }

  
}
