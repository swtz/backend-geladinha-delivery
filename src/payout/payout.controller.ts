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
import { ParseBrDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponsePayoutDto } from './dto/response-payout.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { ParseBrWorkDatePipe } from 'src/delivery/pipes/parse-br-work-date.pipe';

@Roles(Role.Admin, Role.Operator, Role.Motoboy)
@Controller('payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get('preview')
  async preview(
    @Query('from', ParseBrWorkDatePipe) from: Date,
    @Query('to', ParseBrWorkDatePipe) to: Date,
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };
    const payout = await this.payoutService.preview(from, to, qo);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @Post()
  async create(
    @Body('from', new ParseBrDatePipe(START_TIME)) from: Date,
    @Body('to', new ParseBrDatePipe(END_TIME)) to: Date,
    @Body('name') name: string,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo = !name && !phone && !id ? {} : { name, phone, id };
    const preview = await this.payoutService.preview(from, to, qo);
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
    @Query('workDay', new ParseBrDatePipe(START_TIME)) workDay: Date,
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
