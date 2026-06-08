import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { IntervalTimeService } from '../services/interval-time.service';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ResponseIntervalTimeDto } from '../dto/interval-time/response-interval-time.dto';

@Controller('me/interval-time')
@Roles(Role.Admin, Role.Operator)
export class IntervalTimeController {
  constructor(private readonly intervalTimeService: IntervalTimeService) {}

  @Post()
  async create(
    @Body() dto: CreateIntervalTimeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const intervalTime = await this.intervalTimeService.create(dto, req.user);
    return new ResponseIntervalTimeDto(intervalTime);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const intervalTime = await this.intervalTimeService.findOneByOrFail({ id });
    return new ResponseIntervalTimeDto(intervalTime);
  }
}
