import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NextFunction } from 'express';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault(['password']))
export class TempUser extends Document {
  @Prop({ lowercase: true, required: [true, 'First Name Is Required!'] })
  readonly firstName: string;

  @Prop({ lowercase: true, required: [true, 'Last Name Is Required!'] })
  readonly lastName: string;

  @Prop({ unique: true, required: [true, 'Email Address Is Required!'] })
  @IsEmail()
  readonly email: string;

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
    default: true
  })
  readonly isNewUser: boolean;

  get isSocial(): boolean {
    return !!(this.socialId);
  }

  validatePassword: (password: string) => boolean;
}

const TempUserModelName = 'Temp_User';
const TempUserSchema = CREATE_SCHEMA<TempUser>(TempUser);

// TempUserSchema.index({ 'skills.name': 1 }, { unique: true });

TempUserSchema.pre('save', async function (next: NextFunction) {
  if (this.isNew && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

TempUserSchema.pre<TempUser>('save', async function (next: NextFunction) {
  if (!this.isModified('password') || this.isNew) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

TempUserSchema.methods.validatePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const TempUserModel = { name: TempUserModelName, schema: TempUserSchema };

export { TempUserSchema, TempUserModelName, TempUserModel };
