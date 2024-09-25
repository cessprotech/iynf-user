import { FilterQuery, Model, PaginateModel, PaginateOptions, startSession } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './app.dto';
import { User, Withdrawal, WithdrawalModelName } from './app.schema';
import { UserAuthSessionInterface, User_Auth_Session } from '@app/authentication';
import { AgeAndAbove, generateUsername } from '@app/common/helpers';
import { TempUser, TempUserModelName } from './schema/temp.users.schema';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from './app.constants';
// import { CachingService } from '@libs/modules/caching';
@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User> & PaginateModel<User>,

    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<Withdrawal> & PaginateModel<Withdrawal>,

    @InjectModel(TempUserModelName) public readonly tempUserModel: Model<TempUser>,

    @InjectModel(User_Auth_Session.name)
    private readonly userAuthSessionModel: Model<User_Auth_Session> & PaginateModel<User>,
    
    @Inject(APP_CONFIG.NOTIFICATION_SERVICE) private readonly notificationClient: ClientProxy,
  ) {}

  async findAll(query: Record<string, any>, paginateOptions: PaginateOptions = {}) {
    const {page, limit, select, sort, ...rest} = query;

    return await this.userModel.paginate(rest, paginateOptions);
    // let userQuery = this.apiFeatures.api(this.userModel, query)
    //                 .filter()
    //                 .search(['name', 'email'])
    //                 .sort()
    //                 .limitFields()

    // if (populate !== undefined) userQuery = userQuery.populate(populate);

    // return await userQuery.query.lean();
  }

  async getOne(id: string) {
    
    const user = await this.userModel.findOne({$or: [
      {_id: id || ''},
      {userId: id || ''}
    ]});

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const date = new Date(user.dob);

    const options: any = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric"
    };

    const formattedDate = date.toLocaleDateString("en-US", options);

    user.dob = formattedDate

    return user;
  }

  async getOneBy(fields: FilterQuery<User>) {
    const user = await this.userModel.findOne(fields);

    if (!user) {
      return false
    }

    return true;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username) {
      const usernameExists = await this.userModel.findOne({ username: updateUserDto.username });

      if (usernameExists) throw new BadRequestException('username exists. Please use another username.');
    }

    const user = await this.getOne(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const updateData: Record<string, unknown> = {
      ...updateUserDto
    };

    const isNewUserDto = {
      username: updateUserDto.username || user.username,
      country: updateUserDto.country || user.country,
      phone: updateUserDto.phone || user.phone,
      dob: updateUserDto.dob || user.dob,
    }

    if (user.isNewUser) {
      if (isNewUserDto.country && isNewUserDto.username && isNewUserDto.dob && isNewUserDto.phone) {
        if (AgeAndAbove(isNewUserDto.dob, 13)) updateData.isNewUser = false;
        else if (updateUserDto.dob) throw new BadRequestException('Date Of Birth must 13 years and above.');
      }
    }

    return await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { ...updateData }
    ,{
      new: true,
      runValidators: true
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async changePassword(userCdt: { email: string, currentPassword: string, newPassword: string }) {
    const user = await this.userModel.findOne({ email: userCdt.email });

    if (!user || !(await user.validatePassword(userCdt.currentPassword))) {
      throw new NotFoundException('Invalid Password!');
    }

    user.password = userCdt.newPassword;

    user.save({ validateModifiedOnly: true, validateBeforeSave: false });

    await this.updateAuthSession({ email: user.email }, { lastPasswordChanged: new Date(Date.now())})

    return user;
  }

  async updateAuthSession(query: Partial<UserAuthSessionInterface>, userAuthDets: Partial<UserAuthSessionInterface>) {
    return await this.userAuthSessionModel.findOneAndUpdate(query, userAuthDets);
  }

  async generateUsername() {
    const name = generateUsername();

    if (!(await this.getOneBy({ username: name }))) {
      return name;
    }

    return await this.generateUsername();
  }

  async updateBalance(influencerId: string, amount: number) {
    const influencer = await this.userModel.findOne({ influencerId });
    
    let price = influencer.balance
    price += amount

    return await this.userModel.findOneAndUpdate(
      { influencerId: influencerId },
      { $set: { balance: price } },
      {
        new: true,
        runValidators: true
      }
    )
  }

  
  
  // async addbalance() {

  //   return await  this.userModel.updateMany(
  //     {},
  //     { $set: { balance: 0 } }
  // );

  // }

  
  
  async withdrawBalance(body: any) {
    let data = await this.userModel.findOne({ userId: body.userId });

    if (!data) {
      throw new NotFoundException('Invalid userId!');
    }

    let bal = data.balance

    if(body.amount > bal){
      throw new NotFoundException('insufficient funds!');
    }

    bal -= body.amount
    await this.userModel.findOneAndUpdate(
      { userId: body.userId },
      { $set: { balance: bal } },
      {
        new: true,
        runValidators: true
      }
    )
    const admin =  await this.withdrawalModel.create(body);     

    return { message: 'success', admin }    
  }

  async fetchUserWithdrawal(query?: Record<string, any>, paginateOptions: PaginateOptions = {}) {
    const {page, limit, select, sort, ...rest} = query;
    
    return await this.withdrawalModel.paginate(rest, paginateOptions);
  }
}
