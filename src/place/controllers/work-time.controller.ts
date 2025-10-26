import {
  Controller,
  Get,
  ParseBoolPipe,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { WorkTimeService } from '../services/work-time.service';
import { Shift } from 'src/common/enums/work-shifts.enum';

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
}
