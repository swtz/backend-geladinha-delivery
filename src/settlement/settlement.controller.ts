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
import { SettlementService } from './settlement.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { ResponseSettlementDto } from './dto/response-settlement.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';
import { ParseTimezoneDatePipe } from 'src/delivery/pipes/parse-timezone-date.pipe';
import { validateFindOneParamsOrFail } from 'src/common/utils/validate-find-one-params-or-fail';
import { User } from 'src/user/entities/user.entity';
import { ParseEmailPipe } from 'src/user/pipes/format-email.pipe';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { ParsePlaceCodePipe } from 'src/place/pipes/parse-place-code.pipe';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';
import { Settlement } from './entities/settlement.entity';
import {
  CommonType,
  ParseOrderParamsPipe,
} from 'src/delivery/pipes/parse-order-params.pipe';
import { settlementOrderMap } from 'src/common/data/entity-instructions/ordering';

@Roles(Role.Admin, Role.Operator)
@Controller('settlement')
export class SettlementController {
  constructor(
    private readonly settlementService: SettlementService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get('preview')
  async preview(
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
  ) {
    const qo = validateFindOneParamsOrFail<Partial<User>>({
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

    const settlement = await this.settlementService.preview(qo, from, to);

    return new ResponseSettlementDto({ ...settlement, placeCode: '' });
  }

  @Post()
  async create(
    @Body(ParsePlaceCodePipe)
    {
      from: fromDate,
      to: toDate,
      initValue,
      description,
      placeCode,
      user: userData,
    }: CreateSettlementDto,
  ) {
    const qo = validateFindOneParamsOrFail<Partial<User>>(userData);
    const { initDate: from, endDate: to } =
      await this.workTimeDateService.create(qo, fromDate, toDate);

    const preview = await this.settlementService.preview(qo, from, to);
    const settlement = await this.settlementService.create(
      { ...preview, placeCode },
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
    @Query('isClosed', new ParseBoolPipe({ optional: true })) isClosed: boolean,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('placeCode', ParsePlaceCodePipe) placeCode: string,
    @Query(new ParseOrderParamsPipe<CommonType<Settlement>>(settlementOrderMap))
    orderParams: {
      [K in keyof FindOptionsOrder<Settlement>]: FindOptionsOrderValue;
    },
  ) {
    const settlements = await this.settlementService.findAll(
      {
        weekDay,
        workDay,
        operator: {
          nickname,
          id,
          name,
          lastName,
          email,
          phone,
          secondPhone,
        },
        isClosed,
        placeCode,
      },
      orderParams,
    );
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
  @Patch(':id/code')
  async updatePlaceCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('placeCode', ParsePlaceCodePipe) placeCode: string,
  ) {
    const settlement = await this.settlementService.updatePlaceCode(
      id,
      placeCode,
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
