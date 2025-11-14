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
import { PayoutService } from './payout.service';
import { ResponsePayoutDto } from './dto/response-payout.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { ParseBrWorkDatePipe } from 'src/delivery/pipes/parse-br-work-date.pipe';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';

@Roles(Role.Admin, Role.Operator, Role.Motoboy)
@Controller('payout')
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get('preview')
  async preview(
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('year') year: string = `${new Date().getFullYear()}`,
    @Query('month') month: string = `${new Date().getMonth() + 1}`,
    @Query('fromDay') fromDay: string = `${new Date().getDate()}`,
    @Query('toDay') toDay: string = `${new Date().getDate()}`,
    @Query('hours') hours: string,
    @Query('minutes') minutes: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };
    const fromData = { year, month, day: fromDay, hours, minutes };
    const toData = { year, month, day: toDay, hours, minutes };

    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromData, toData);

    console.log(from);
    console.log(to);

    const payout = await this.payoutService.preview(qo, from, to);

    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @Post()
  async create(
    @Body('from', ParseBrWorkDatePipe) from: Date,
    @Body('to', ParseBrWorkDatePipe) to: Date,
    @Body('name') name: string,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };
    const preview = await this.payoutService.preview(qo, from, to);
    const payout = await this.payoutService.create(preview);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Motoboy)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const payouts = await this.payoutService.findAllOwned(req.user);
    const parsedPayouts = payouts.map(item => new ResponsePayoutDto(item));
    return parsedPayouts;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.findOneByOrFail({ id });
    return new ResponsePayoutDto(payout);
  }

  @Get()
  async findAll(
    @Query('weekDay', new ParseEnumPipe(WeekDay, { optional: true }))
    weekDay: WeekDay,
    @Query('workDay', ParseBrWorkDatePipe) workDay: Date,
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
  ) {
    const payouts = await this.payoutService.findAll({
      weekDay,
      workDay,
      motoboy: { name, phone },
      isClosed,
    });
    const parsedPayouts = payouts.map(payout => new ResponsePayoutDto(payout));
    return parsedPayouts;
  }

  @Roles(Role.Admin, Role.Operator)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.update(id);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin)
  @Patch(':id/:flag')
  async updateIsClosed(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('flag', ParseBoolPipe) flag: boolean,
  ) {
    const payout = await this.payoutService.updateIsClosed(id, flag);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.remove(id);
    return new ResponsePayoutDto(payout);
  }
}
