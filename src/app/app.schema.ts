import { Prop, Schema  } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NextFunction } from 'express';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault(['password', 'socialId']))
export class User extends Document {

  @Prop({ default: () => nanoid(12), unique: true })
  readonly userId: string;

  @Prop({ lowercase: true, required: [true, 'First Name Is Required!'] })
  readonly firstName: string;

  @Prop({ lowercase: true, required: [true, 'Last Name Is Required!'] })
  readonly lastName: string;

  @Prop({ unique: true, required: [true, 'Email Address Is Required!'] })
  @IsEmail()
  readonly email: string;

  @Prop({ lowercase: true })
  readonly username?: string;

  @Prop({ lowercase: true })
  dob?: string;

  @Prop()
  password?: string;

  @Prop()
  socialId?: string;

  @Prop({
    enum: {
      values: ['google', 'facebook'],
      message: 'Invalid {VALUE}. Type must be `google` or `facebook`.'
    }
  })
  socialType?: string;

  @Prop({
    enum: {
      values: ['creator', 'influencer'],
      message: 'Invalid role. Role must be `creator` or `influencer`.'
    }
  })
  role?: string;

  @Prop({ lowercase: true })
  readonly country: string;

  @Prop({ lowercase: true })
  readonly phone: string;

  @Prop({})
  readonly avatar: string;

  @Prop({})
  readonly cover: string;

  @Prop({})
  readonly creatorId: string;

  @Prop({})
  readonly influencerId: string;

  @Prop({
    required: [
      true,
      'Terms And Conditions Must Be Agreed Before User Can Be Registered!',
    ],
  })
  readonly termsAndConditionsAgreement: boolean;

  @Prop({ lowercase: true })
  readonly linkedin: string;

  @Prop({ lowercase: true })
  readonly twitter: string;

  @Prop({ default: true })
  readonly isNewUser: boolean;

  @Prop({ default: false })
  readonly isSocial: boolean;

  @Prop({ default: false })
  readonly verified: boolean;

  @Prop({ default: false })
  readonly verifiedEmail: boolean;

  @Prop({ default: 0 })
  readonly followers: number;

  @Prop({ default: 0 })
  readonly following: number;

  @Prop({ default: 0 })
  readonly views: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0 })
  balance: number;

  validatePassword: (password: string) => Promise<boolean>;
}

const UserModelName = User.name;
const UserSchema = CREATE_SCHEMA<User>(User);

// UserSchema.index({ 'skills.name': 1 }, { unique: true });

UserSchema.pre('save', async function (next: NextFunction) {
  if ((this.isNew && this.password) || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

UserSchema.methods.validatePassword = async function (password: string) {
  if (!this.password) return false;

  return await bcrypt.compare(password, this.password);
};



@Schema({ timestamps: true })
export class Admin extends Document{ 
    @Prop({ unique: [true, 'Duplicate email entered'] })
    email: string

    @Prop()
    password: string

    validatePassword: (password: string) => Promise<boolean>;
}

const AdminModelName = Admin.name;
const AdminSchema = CREATE_SCHEMA<Admin>(Admin);


AdminSchema.pre('save', async function (next: NextFunction) {
  if ((this.isNew && this.password) || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

AdminSchema.methods.validatePassword = async function (password: string) {
  if (!this.password) return false;

  return await bcrypt.compare(password, this.password);
};



@Schema({ timestamps: true })
export class Notification extends Document{ 
    @Prop()
    title: string

    @Prop()
    body: string

    @Prop()
    type: string

    @Prop()
    img: string
}

const NotificationModelName = Notification.name;
const NotificationSchema = CREATE_SCHEMA<Notification>(Notification);


@Schema({ timestamps: true })
export class Withdrawal extends Document{ 
    @Prop()
    userId: string
    
    @Prop()
    accountNumber: string

    @Prop()
    bankName: string

    @Prop()
    accountName: string

    @Prop()
    amount: number
    
    @Prop({ default: false })
    cleared: boolean;
}

const WithdrawalModelName = Withdrawal.name;
const WithdrawalSchema = CREATE_SCHEMA<Withdrawal>(Withdrawal);



const AdminModel = { name: AdminModelName, schema: AdminSchema };

const NotificationModel = { name: NotificationModelName, schema: NotificationSchema };

const WithdrawalModel = { name: WithdrawalModelName, schema: WithdrawalSchema };

const UserModel = { name: UserModelName, schema: UserSchema };


export { UserSchema, UserModelName, UserModel, AdminModel, AdminModelName, AdminSchema, NotificationModel, NotificationModelName,  NotificationSchema, WithdrawalModel, WithdrawalModelName, WithdrawalSchema  };
