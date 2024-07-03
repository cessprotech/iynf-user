import { Prop, Schema } from '@nestjs/mongoose';
import { Document, PaginateModel } from 'mongoose';
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

@Schema(customPropsDefault())
export class Follow extends Document {
  @Prop({ required: [true, 'FollowerId Is Required!'] })
  readonly followerId: string;

  @Prop({ required: [true, 'userId Is Required!'] })
  readonly userId: string;
}

const FollowModelName = Follow.name;
const FollowSchema = CREATE_SCHEMA<Follow>(Follow);

FollowSchema.virtual('user', {
  ref: "User",
  localField: 'userId',
  foreignField: 'userId',
  justOne: true,
  options: {
    select: {
      userId: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      avatar: 1,
      verified: 1
    }
  }
})

FollowSchema.virtual('follower', {
  ref: "User",
  localField: 'followerId',
  foreignField: 'userId',
  justOne: true,
  options: {
    select: {
      userId: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      avatar: 1,
      verified: 1
    }
  }
})


FollowSchema.pre('save', async function (next: NextFunction) {

  next();
});

FollowSchema.pre<Follow>('save', async function (next: NextFunction) {

  next();
});

const FollowModel = { name: FollowModelName, schema: FollowSchema };

export { FollowSchema, FollowModelName, FollowModel };
