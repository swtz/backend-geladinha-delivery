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
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTimeService } from './work-time.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateWorkTimeDto } from './dto/create-work-time.dto';
import { UpdateWorkTimeDto } from './dto/update-work-time.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@Roles(Role.Admin)
@Controller('work-time')
export class WorkTimeController {
  constructor(private readonly workTimeService: WorkTimeService) {}

  @Get()
  async findAll(
    @Query('shift', new ParseEnumPipe(Shift, { optional: true })) shift: Shift,
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault: boolean,
  ) {
    const workTime = await this.workTimeService.findAll({ shift, isDefault });
    return workTime;
  }

  @Roles(Role.Admin, Role.Operator, Role.Motoboy)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const workTime = await this.workTimeService.findAllOwned(req.user);
    return workTime;
  }

  @Post()
  async create(@Body() dto: CreateWorkTimeDto) {
    const workTime = await this.workTimeService.create_new(dto);
    return workTime;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkTimeDto,
  ) {
    const workTime = await this.workTimeService.update(id, dto);
    return workTime;
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const workTime = await this.workTimeService.remove(id);
    return workTime;
  }
}
