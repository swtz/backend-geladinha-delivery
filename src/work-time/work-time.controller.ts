import {
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTimeService } from './work-time.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';

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
    const shifts = await this.workTimeService.findAll({ shift, isDefault });
    return shifts;
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const workTime = await this.workTimeService.remove(id);
    return workTime;
  }
}
