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
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { ParseBrDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ResponsePayoutDto } from './dto/response-payout.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { WeekDay } from 'src/common/enums/weekDays.enum';

@Roles(Role.Admin, Role.Operator, Role.Motoboy)
@Controller('payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @UseGuards(JwtAuthGuard)
  @Get('preview')
  async preview(
    @Query('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Query('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Query('motoboy') motoboy: string,
  ) {
    const payout = await this.payoutService.preview(fromDate, toDate, motoboy);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Body('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Body('motoboy') motoboy: string,
  ) {
    const preview = await this.payoutService.preview(fromDate, toDate, motoboy);
    const payout = await this.payoutService.create(preview);
    return new ResponsePayoutDto(payout);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.findOneByOrFail({ id });
    return new ResponsePayoutDto(payout);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('weekDay', new ParseEnumPipe(WeekDay, { optional: true }))
    weekDay: WeekDay,
    @Query('workDay', new ParseBrDatePipe(START_TIME)) workDay: Date,
    @Query('motoboy') motoboyName: string,
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
  ) {
    const payouts = await this.payoutService.findAll({
      weekDay,
      workDay,
      motoboy: { name: motoboyName },
      isClosed,
    });
    const parsedPayouts = payouts.map(payout => new ResponsePayoutDto(payout));
    return parsedPayouts;
  }

  @Roles(Role.Admin, Role.Operator)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.update(id);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/:flag')
  async updateIsClosed(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('flag', ParseBoolPipe) flag: boolean,
  ) {
    const payout = await this.payoutService.updateIsClosed(id, flag);
    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const payout = await this.payoutService.remove(id);
    return new ResponsePayoutDto(payout);
  }
}
