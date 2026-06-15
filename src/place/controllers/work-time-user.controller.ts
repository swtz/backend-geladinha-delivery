import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { WorkTimePlaceUserService } from '../services/work-time-place-user.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';
import { ResponseUserDto } from 'src/user/dtos/user/response-user.dto';
import { CreateIntervalTimeDto } from 'src/work-time/dto/interval-time/create-interval-time.dto';
import { ResponseIntervalTimeDto } from 'src/work-time/dto/interval-time/response-interval-time.dto';

@Roles(Role.Admin)
@Controller('work-time-user')
export class WorkTimeUserController {
  constructor(
    private readonly workTimePlaceUserService: WorkTimePlaceUserService,
  ) {}

  @Put(':id')
  async setToUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateWorkTimeDto,
  ) {
    const user = await this.workTimePlaceUserService.setToUser(id, dto);
    return new ResponseUserDto(user);
  }

  @Put('shared/:userId/:workTimeId')
  async setSharedToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('workTimeId', ParseUUIDPipe) workTimeId: string,
  ) {
    const user = await this.workTimePlaceUserService.setSharedToUser(
      userId,
      workTimeId,
    );
    return new ResponseUserDto(user);
  }

  @Post('interval-time/:id')
  async createIntervalTime(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIntervalTimeDto,
  ) {
    const intervalTime = await this.workTimePlaceUserService.createIntervalTime(
      id,
      dto,
    );
    return new ResponseIntervalTimeDto(intervalTime);
  }
}
