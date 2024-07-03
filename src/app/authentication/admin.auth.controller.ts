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
  import { HttpValidationFilter } from '@core/common/filters/validation.filter';
  import { Response } from '@core/common/interceptors/response';
  import { LogService, Logger } from '@core/logger';
  import {
    ApiBadGatewayResponse,
    ApiCreatedResponse,
    ApiTags,
  } from '@nestjs/swagger';
  import { Protect, Public } from '@core/auth/modules';
  import { USER_RESPONSE } from '../app.response';
  import { ApplyCache, CacheData } from '@core/modules/caching';
  import { Request } from 'express';
  import { MongooseExceptionFilter } from '@core/common/filters';
  import { QueryOptions } from '@app/common/helpers';
import { AdminService } from './admin.auth.service';
  
  // @Protect()
  @ApiTags('Admin Authenticated Routes')
  @UseFilters(HttpValidationFilter)
  @UseFilters(MongooseExceptionFilter)
  @Controller('admin/auth')
  export class AdminController {
    @Logger(AdminController.name) private readonly logger: LogService;
  
    constructor(private readonly adminService: AdminService) {}
    
    // @Protect()
    @Get('users')
    // @CacheData('FIND_ALL')
    @Response(USER_RESPONSE.FIND_ALL)
    async findAll(@Query() query) {
      const { otherQuery, paginateOptions } = QueryOptions(query, true);
      
      return await this.adminService.findAll(otherQuery, paginateOptions);
    }
  
    // @Protect()
    @ApiBadGatewayResponse({ description: 'Invalid Id' })
    @Get(':id/single')
    // @CacheData('FIND_ONE')
    @Response(USER_RESPONSE.FIND_ONE_BY_ID)
    async getOne(@Param('id') id: string) {

      return await this.adminService.getOne(id);
    }
  
    // @Protect()
    @Response(USER_RESPONSE.DEFAULT)
    @Patch(':id/single')
    async blockAndUnblock(@Param('id') id: string, @Body() updateUserDto: { active: boolean }) {
      return await this.adminService.blockAndUnblockUser(id, updateUserDto);
    }
  

    // @Protect()
    @Response(USER_RESPONSE.DEFAULT)
    @Post('keyword')
    async checkUsername(@Body() search: { keyword: string }) {
      return await this.adminService.searchBy(search);
    }
    
  }
  