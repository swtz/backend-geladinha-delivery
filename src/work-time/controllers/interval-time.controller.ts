import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { IntervalTimeService } from '../services/interval-time.service';
import { ResponseIntervalTimeDto } from '../dto/interval-time/response-interval-time.dto';
import { UpdateIntervalTimeDto } from '../dto/interval-time/update-interval-time.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { IntervalTime } from '../entities/interval-time.entity';

@Controller('interval-time')
@Roles(Role.Admin, Role.Operator)
export class IntervalTimeController {
  constructor(private readonly intervalTimeService: IntervalTimeService) {}

  @Post()
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntervalTimeDto,
  ) {
    const intervalTime = await this.intervalTimeService.update(id, dto);
    return new ResponseIntervalTimeDto(intervalTime);
  }

  @Get('me')
  async findMy(@Req() req: AuthenticatedRequest) {
    const {
      intervalTime: reqIntervalTime,
    }: { intervalTime: IntervalTime | null } = req.user;

    if (!reqIntervalTime) {
      throw new NotFoundException('Tempo de Intervalo não encontrado');
    }

    const intervalTime = await this.intervalTimeService.findOneByOrFail({
      id: reqIntervalTime.id,
    });

    return new ResponseIntervalTimeDto(intervalTime);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const intervalTime = await this.intervalTimeService.findOneByOrFail({ id });
    return new ResponseIntervalTimeDto(intervalTime);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const intervalTime = await this.intervalTimeService.remove(id);
    return new ResponseIntervalTimeDto(intervalTime);
  }
}
