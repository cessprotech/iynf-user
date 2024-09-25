import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseFilters,
  Query,
  BadRequestException,
  UploadedFile,
  UseInterceptors ,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from '../app.service';
import { SaveAvatarDto, SaveCoverDto, UpdateUserDto, UploadMediaUrlDto, UserDto } from '../app.dto';
import { HttpValidationFilter } from '@core/common/filters/validation.filter';
import { Response } from '@core/common/interceptors/response';
import { LogService, Logger } from '@core/logger';
import {
  ApiBadGatewayResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDto, UserAuth } from '@app/authentication';
import { ChangePasswordSession, Protect, Public } from '@core/auth/modules';
import { USER_RESPONSE } from '../app.response';
import { generateUploadURL } from '@app/common/media-upload/cloud';
import * as mime from 'mime-types';
import { FollowService } from '@app/services/follow.service';
import { QueryOptions } from '@app/common/helpers';

@Protect()
@ApiTags('Users/me')
@UseFilters(HttpValidationFilter)
@Controller('me')
export class MeController {
  @Logger(MeController.name) private readonly logger: LogService;

  constructor(private readonly appService: AppService, private readonly followService: FollowService) { }

  @ApiBadGatewayResponse({ description: 'Invalid Id' })
  @Get('')
  @Response(USER_RESPONSE.FIND_ONE_BY_ID)
  async getOne(@Req() req) {
    return await this.appService.getOne(req.user._id);
  }

  @Patch('')
  @Response(USER_RESPONSE.UPDATE)
  update(@Req() req, @Body() updateUserDto: UserDto) {

    return this.appService.update(req.user._id, updateUserDto);
  }

  // @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appService.remove(id);
  }

  @Post('change-password')
  @ChangePasswordSession()
  async changePassword(@Body() body: ChangePasswordDto, @Req() req) {
    const {
      currentPassword, newPassword
    } = body;

    const user = await this.appService.changePassword({
      email: req.user.email,
      currentPassword,
      newPassword,
    });

    return user;
  }

  @Post('upload_media_url')
  @Response(USER_RESPONSE.DEFAULT)
  @UseInterceptors(FileInterceptor('image'))
  async uploadMedia(@UploadedFile() image: Express.Multer.File) {
    return await generateUploadURL(image);;
  }

  // old image upload with S3Client (2)
  // async uploadMedia(@Body() body) {
  //   let uploadMedia = body;

  //   if (uploadMedia.contentType === undefined || mime.extension(uploadMedia.contentType) === false) throw new BadRequestException('Invalid contentType in query.');

   
  //   return await generateUploadURL(uploadMedia.body);
  // }


  // old image upload with S3Client (1)
  // async uploadMedia(@Query() query: UploadMediaUrlDto, @Req() req) {
  //   let uploadMedia = query;

  //   if (uploadMedia.contentType === undefined || mime.extension(uploadMedia.contentType) === false) throw new BadRequestException('Invalid contentType in query.');

  //   const contentType = uploadMedia.contentType.split('/')[0];

  //   if (contentType !== 'image') throw new BadRequestException(`${uploadMedia.field} must be an image.`);

  //   const contentTypeExt = uploadMedia.contentType.split('/')[1];

  //   const folder = `users/${uploadMedia.field}s`;

  //   const mediaName = `user-${req.user?.userId}-${uploadMedia.field}.${contentTypeExt}`;
  //   return await generateUploadURL({
  //     folder,
  //     mediaName,
  //     contentType: uploadMedia.contentType
  //   });
  // }

  @Post('save_avatar')
  @Response(USER_RESPONSE.DEFAULT)
  async saveAvatar(@Body() body: SaveAvatarDto, @Req() req) {
    return this.appService.update(req.user._id, { avatar: body.avatar });
  }

  @Post('save_cover')
  @Response(USER_RESPONSE.DEFAULT)
  async saveCover(@Body() body: SaveCoverDto, @Req() req) {
    return this.appService.update(req.user._id, { cover: body.cover });
  }

  @Post('follow/:userId')
  @Response(USER_RESPONSE.DEFAULT)
  async follow(@Param('userId') userId: string, @Req() req) {
    return this.followService.follow(req.user.userId, userId);
  }

  @Post('unfollow/:userId')
  @Response(USER_RESPONSE.DEFAULT)
  async unfollow(@Param('userId') userId: string, @Req() req) {
    return this.followService.unfollow(req.user.userId, userId);
  }

  
  // @Patch(`balance`)
  // @Response(USER_RESPONSE.DEFAULT)
  // async addbalance() {
  //   return await this.appService.addbalance();
  // }
  
  @Post('withdraw')
  @Response(USER_RESPONSE.CREATE)
  async withdrawBalance(@Body() body: any) {
    return await this.appService.withdrawBalance(body);
  }

  // fetch notification
  @Get('withdraw/:userid')
  async fetchUserWithdrawal(@Param('userId') userId: string, @Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);
        
    return await this.appService.fetchUserWithdrawal({ ...otherQuery, userId }, paginateOptions);
  }
}
