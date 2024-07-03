import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // Request,
  UseFilters,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HttpValidationFilter } from '@core/common/filters/validation.filter';
import { Response } from '@core/common/interceptors/response';
import { LogService, Logger } from '@core/logger';
import {
  ApiBadGatewayResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Protect, Public } from '@core/auth/modules';
import { USER_RESPONSE } from './app.response';
import { ApplyCache, CacheData } from '@core/modules/caching';
import { Request } from 'express';
import { MongooseExceptionFilter } from '@core/common/filters';
import { QueryOptions } from '@app/common/helpers';
import { FollowService } from './services/follow.service';

@Protect()
@ApiTags('Users')
@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@Controller()
@ApplyCache()
export class AppController {
  @Logger(AppController.name) private readonly logger: LogService;

  constructor(private readonly appService: AppService, private readonly followService: FollowService) {}
  
  @Public()
  @Get()
  @CacheData('FIND_ALL')
  @Response(USER_RESPONSE.FIND_ALL)
  async findAll(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);
    
    return await this.appService.findAll(otherQuery, paginateOptions);
  }

  @Public()
  @ApiBadGatewayResponse({ description: 'Invalid Id' })
  @Get(':id/single')
  @CacheData('FIND_ONE')
  @Response(USER_RESPONSE.FIND_ONE_BY_ID)
  async getOne(@Param('id') id: string, @Req() req: Request) {
    
    return await this.appService.getOne(id);
  }

  @Public()
  @Get(':followerId/follows/:userId')
  @Response(USER_RESPONSE.DEFAULT)
  async isFollowing(@Param('followerId') followerId: string, @Param('userId') userId: string) {

    return this.followService.isFollowing(followerId, userId);
  }

  // // @Patch(':id/single')
  // @Response(USER_RESPONSE.UPDATE)
  // update(@Param('id') id: string, @Body() updateUserDto: Record<string, any>) {
  //   return this.appService.update(id, updateUserDto);
  // }

  // // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.appService.remove(id);
  // }

  @Public()
  @Response(USER_RESPONSE.DEFAULT)
  @Get('generate-username')
  async generateUsername() {
    return await this.appService.generateUsername();
  }
  
  @Public()
  @Response(USER_RESPONSE.DEFAULT)
  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return await this.appService.getOneBy({ username });
  }

  @Get('followers/:userId')
  @Response(USER_RESPONSE.DEFAULT)
  async followers(@Param('userId') userId: string, @Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'follower' }
    ];
    
    return this.followService.getAllFollows({ ...otherQuery, userId }, paginateOptions);
  }
  
  @Get('following/:userId')
  @Response(USER_RESPONSE.DEFAULT)
  async followings(@Param('userId') userId: string, @Query() query) {

    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'user' }
    ];

    return this.followService.getAllFollows({ ...otherQuery, followerId: userId }, paginateOptions);
  }
  
}
