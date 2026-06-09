import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { WorkTimePlaceUserService } from '../services/work-time-place-user.service';
import { WorkTimeDateService } from '../services/work-time-date.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';
import { UserService } from 'src/user/services/user.service';
import { ResponseUserDto } from 'src/user/dtos/user/response-user.dto';

@Roles(Role.Admin)
@Controller('work-time-user')
export class WorkTimeUserController {
  constructor(
    private readonly workTimePlaceUserService: WorkTimePlaceUserService,
    private readonly userService: UserService,
    private readonly workTimeDateService: WorkTimeDateService,
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
}
