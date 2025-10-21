import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseFloatPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { ParseBrDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponseSettlementDto } from './dto/response-settlement.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('preview')
  async preview(
    @Query('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Query('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Query('optName') optName: string,
    @Query('optPhone', ParseBrPhonePipe) optPhone: string,
  ) {
    const qo =
      optName === undefined && optPhone === undefined
        ? {}
        : { name: optName, phone: optPhone };
    const settlement = await this.settlementService.preview(
      qo,
      fromDate,
      toDate,
    );
    return new ResponseSettlementDto(settlement);
  }

  @Post()
  async create(
    @Body('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Body('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Body('operatorName') operatorName: string,
    @Body('initValue', ParseFloatPipe) initValue: number,
    @Body('description') description: string,
  ) {
    const preview = await this.settlementService.preview(
      { name: operatorName },
      fromDate,
      toDate,
    );
    const settlement = await this.settlementService.create(
      preview,
      initValue,
      description,
    );
    return new ResponseSettlementDto(settlement);
  }

  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const settlements = await this.settlementService.findAllOwned(req.user);
    const parsedSettlements = settlements.map(
      item => new ResponseSettlementDto(item),
    );
    return parsedSettlements;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const settlement = await this.settlementService.findOneByOrFail({ id });
    return new ResponseSettlementDto(settlement);
  }

  @Get()
  async findAll(
    @Query('weekDay', new ParseEnumPipe(WeekDay, { optional: true }))
    weekDay: WeekDay,
    @Query('workDay', new ParseBrDatePipe(START_TIME)) workDay: Date,
    @Query('operatorName') operatorName: string,
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
  ) {
    const settlements = await this.settlementService.findAll({
      weekDay,
      workDay,
      operator: { name: operatorName },
      isClosed,
    });
    const parsedSettlements = settlements.map(
      item => new ResponseSettlementDto(item),
    );
    return parsedSettlements;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('description') description: string,
  ) {
    const settlement = await this.settlementService.update(id, description);
    return new ResponseSettlementDto(settlement);
  }

  @Roles(Role.Admin)
  @Patch(':id/:flag')
  async updateIsClosed(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('flag', ParseBoolPipe) flag: boolean,
  ) {
    const settlement = await this.settlementService.updateIsClosed(id, flag);
    return new ResponseSettlementDto(settlement);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const settlement = await this.settlementService.remove(id);
    return new ResponseSettlementDto(settlement);
  }
}
