import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTimeService } from '../services/work-time.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateWorkTimeDto } from '../dto/work-time/update-work-time.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { ResponseWorkTimeDto } from '../dto/work-time/response-work-time.dto';

@Roles(Role.Admin)
@Controller('work-time')
export class WorkTimeController {
  constructor(private readonly workTimeService: WorkTimeService) {}

  @Get()
  async findAll(
    @Query('shift', new ParseEnumPipe(Shift, { optional: true })) shift: Shift,
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault: boolean,
    @Query('isShared', new ParseBoolPipe({ optional: true }))
    isShared: boolean,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,

    // precisa-se validar email
    @Query('email') email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const workTimes = await this.workTimeService.findAll({
      shift,
      isDefault,
      isShared,
      user: {
        nickname,
        id,
        name,
        lastName,
        email,
        phone,
        secondPhone,
      },
    });
    const parsedWorkTimes = workTimes.map(
      item => new ResponseWorkTimeDto(item),
    );
    return parsedWorkTimes;
  }

  @Roles(Role.Admin, Role.Operator, Role.Motoboy)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const workTimes = await this.workTimeService.findAllOwned(req.user);
    const parsedWorkTimes = workTimes.map(
      item => new ResponseWorkTimeDto(item),
    );
    return parsedWorkTimes;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const workTime = await this.workTimeService.findOneByOrFail({ id }, true);
    return new ResponseWorkTimeDto(workTime);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkTimeDto,
  ) {
    const workTime = await this.workTimeService.update(id, dto);
    return new ResponseWorkTimeDto(workTime);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const workTime = await this.workTimeService.remove(id);
    return new ResponseWorkTimeDto(workTime);
  }
}
