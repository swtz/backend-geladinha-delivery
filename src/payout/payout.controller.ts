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
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';
import { ParseTimezoneDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { validateFindUserParamsOrFail } from 'src/common/utils/validate-find-user-params-or-fail';
import { FindUserDto } from 'src/user/dtos/user/find-user.dto';

@Roles(Role.Admin, Role.Operator, Role.Motoboy)
@Controller('payout')
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get('preview')
  async preview(
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,

    // precisa-se validar email
    @Query('email') email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
  ) {
    const qo = validateFindUserParamsOrFail({
      nickname,
      id,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    });

    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromDate, toDate);

    console.log(from);
    console.log(to);

    const payout = await this.payoutService.preview(qo, from, to);

    return new ResponsePayoutDto(payout);
  }

  @Roles(Role.Admin, Role.Operator)
  @Post()
  async create(
    @Body('user') userData: FindUserDto,
    @Body('from') fromDate: string,
    @Body('to') toDate: string,
  ) {
    const qo = validateFindUserParamsOrFail(userData);

    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromDate, toDate);

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
    @Query('workDay', ParseTimezoneDatePipe) workDay: Date,
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,

    // precisa-se validar email
    @Query('email') email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const payouts = await this.payoutService.findAll({
      weekDay,
      workDay,
      motoboy: {
        user: {
          nickname,
          id,
          name,
          lastName,
          email,
          phone,
          secondPhone,
        },
      },
      isClosed,
    });
    const parsedPayouts = payouts.map(payout => new ResponsePayoutDto(payout));
    return parsedPayouts;
  }

  // @Roles(Role.Admin, Role.Operator)
  // @Patch(':id')
  // async update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Query('to') toDate: string,
  // ) {
  //   const payout = await this.payoutService.update(id, toDate);
  //   return new ResponsePayoutDto(payout);
  // }

  // @Roles(Role.Admin)
  // @Patch(':id/:flag')
  // async updateIsClosed(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Param('flag', ParseBoolPipe) flag: boolean,
  // ) {
  //   const payout = await this.payoutService.updateIsClosed(id, flag);
  //   return new ResponsePayoutDto(payout);
  // }

  // @Roles(Role.Admin, Role.Operator)
  // @Delete(':id')
  // async remove(@Param('id', ParseUUIDPipe) id: string) {
  //   const payout = await this.payoutService.remove(id);
  //   return new ResponsePayoutDto(payout);
  // }
}
