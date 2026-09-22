import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ResponseVoucherDto } from './dto/response-voucher.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { Voucher } from './enums/voucher.enum';
import { Voucher as VoucherEntity } from './entities/voucher.entity';
import { validateFindOneParamsOrFail } from 'src/common/utils/validate-find-one-params-or-fail';
import { ParseEmailPipe } from 'src/user/pipes/format-email.pipe';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';
import {
  CommonType,
  ParseOrderParamsPipe,
} from 'src/delivery/pipes/parse-order-params.pipe';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';
import { voucherOrderMap } from 'src/common/data/entity-instructions/ordering';

@Roles(Role.Admin)
@Controller('voucher')
export class VoucherController {
  constructor(
    private readonly voucherService: VoucherService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get()
  async findAll(
    @Query('type', new ParseEnumPipe(Voucher, { optional: true }))
    type: Voucher,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
    @Query(new ParseOrderParamsPipe<CommonType<VoucherEntity>>(voucherOrderMap))
    orderParams: {
      [K in keyof FindOptionsOrder<VoucherEntity>]: FindOptionsOrderValue;
    },
  ) {
    const userData = {
      nickname,
      id,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    };
    const dateObject: {
      initDate?: Date;
      endDate?: Date;
    } = { initDate: undefined, endDate: undefined };

    if (fromDate && toDate) {
      const { initDate, endDate } = await this.workTimeDateService.create(
        userData,
        fromDate,
        toDate,
      );

      dateObject.initDate = initDate;
      dateObject.endDate = endDate;
    }
    const vouchers = await this.voucherService.findAll(
      {
        from: dateObject.initDate,
        to: dateObject.endDate,
        userData,
        type,
      },
      orderParams,
    );
    const parsedVouchers = vouchers.map(
      voucher => new ResponseVoucherDto(voucher),
    );
    return parsedVouchers;
  }

  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const vouchers = await this.voucherService.findAll({
      userData: { id: req.user.id },
    });
    const parsedVouchers = vouchers.map(
      voucher => new ResponseVoucherDto(voucher),
    );
    return parsedVouchers;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const voucher = await this.voucherService.findOneByOrFail({ id });
    return new ResponseVoucherDto(voucher);
  }

  @Post('me')
  async create(
    @Body() dto: CreateVoucherDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const voucher = await this.voucherService.create(dto, req.user);
    return new ResponseVoucherDto(voucher);
  }

  @Post('me/user/:id')
  async createForEntity(
    @Body() dto: CreateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.createForEntity(
      dto,
      req.user,
      id,
    );
    return new ResponseVoucherDto(voucher);
  }

  @Patch('me/:id')
  async update(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    validateFindOneParamsOrFail<VoucherEntity>(dto);
    const voucher = await this.voucherService.update(dto, req.user, id);

    return new ResponseVoucherDto(voucher);
  }

  @Patch('me/user/:id')
  async updateForEntity(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    validateFindOneParamsOrFail<VoucherEntity>(dto, true);
    const voucher = await this.voucherService.updateForEntity(
      dto,
      req.user,
      id,
    );
    return new ResponseVoucherDto(voucher);
  }

  @Delete('me/:id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.remove(id, req.user);
    return new ResponseVoucherDto(voucher);
  }
}
