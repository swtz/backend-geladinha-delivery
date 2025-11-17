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
import { ResponseSettlementDto } from './dto/response-settlement.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';
import { ParseTimezoneDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('settlement')
export class SettlementController {
  constructor(
    private readonly settlementService: SettlementService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get('preview')
  async preview(
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };

    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromDate, toDate);

    console.log(from);
    console.log(to);

    const settlement = await this.settlementService.preview(qo, from, to);

    return new ResponseSettlementDto(settlement);
  }

  @Post()
  async create(
    @Body('name') name: string,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Body('initValue', ParseFloatPipe) initValue: number,
    @Body('description') description: string,
    @Body('from') fromDate: string,
    @Body('to') toDate: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };

    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromDate, toDate);

    const preview = await this.settlementService.preview(qo, from, to);
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
    @Query('workDay', ParseTimezoneDatePipe) workDay: Date,
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
  ) {
    const settlements = await this.settlementService.findAll({
      weekDay,
      workDay,
      operator: { name, phone, id },
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
    @Body('to') toDate: string,
  ) {
    const settlement = await this.settlementService.update(
      id,
      toDate,
      description,
    );

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
