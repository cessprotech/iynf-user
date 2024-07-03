import { Prop, Schema } from '@nestjs/mongoose';
import { Document, PaginateModel, Types } from 'mongoose';
import { NextFunction } from 'express';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { IModel } from '@core/modules/database';
import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault())
export class User_Auth_Session extends Document {

  @Prop({ ref: 'User', type: Types.ObjectId, required: [true, 'User Is Required!'] })
  readonly user: string;

  @Prop({ unique: true, required: [true, 'Email Address Is Required!'] })
  @IsEmail()
  readonly email: string;
  
  @Prop()
  readonly lastLoggedIn: Date;

  @Prop()
  readonly lastPasswordChanged: Date;

}

const UserAuthSessionModelName = User_Auth_Session.name;
const UserAuthSessionSchema = CREATE_SCHEMA<User_Auth_Session>(User_Auth_Session);

// UserAuthSessionSchema.index({ 'skills.name': 1 }, { unique: true });

UserAuthSessionSchema.pre('save', async function (next: NextFunction) {
  next();
});

UserAuthSessionSchema.pre<User_Auth_Session>('save', async function (next: NextFunction) {
  next();
});

const UserAuthSessionModel = { name: UserAuthSessionModelName, schema: UserAuthSessionSchema };

export { UserAuthSessionSchema, UserAuthSessionModelName, UserAuthSessionModel };
