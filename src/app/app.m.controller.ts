import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from '@core/logger';
import { MSController } from '@app/common/helpers';


@Controller()
@MSController()
// @UsePipes(ZodValidationPipe)
export class appMController {

  private logger = new LogService();

  constructor(private readonly appService: AppService) {
    this.logger.setContext(appMController.name);
  }

  @MessagePattern({ cmd: 'ADD_BALANCE' })
  async completeJob(@Payload() data: { influencerId: string, amount: number }) {

    return await this.appService.updateBalance( data.influencerId, data.amount);
  }
}
