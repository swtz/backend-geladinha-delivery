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
import { ParseTimezoneDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';

@Roles(Role.Operator, Role.Motoboy, Role.Admin)
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @Roles(Role.Admin, Role.Operator)
  async findAll(
    @Query('type', new ParseEnumPipe(Voucher, { optional: true }))
    type: Voucher,
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('from', ParseTimezoneDatePipe) from: Date,
    @Query('to', ParseTimezoneDatePipe) to: Date,
  ) {
    const vouchers = await this.voucherService.findAll({
      from,
      to,
      id,
      name,
      phone,
      type,
    });
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
  @Roles(Role.Admin, Role.Operator)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const voucher = await this.voucherService.findOneByOrFail({ id });
    return new ResponseVoucherDto(voucher);
  }

  @Roles(Role.Admin)
  @Post('me')
  async create(
    @Body() dto: CreateVoucherDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const voucher = await this.voucherService.create(dto, req.user);
    return new ResponseVoucherDto(voucher);
  }

  @Post('me/user/:id')
  @Roles(Role.Admin)
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

  @Roles(Role.Admin)
  @Patch('me/:id')
  async update(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.update(dto, req.user, id);
    return new ResponseVoucherDto(voucher);
  }

  @Patch('me/user/:id')
  @Roles(Role.Admin)
  async updateForEntity(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.updateForEntity(
      dto,
      req.user,
      id,
    );
    return new ResponseVoucherDto(voucher);
  }

  @Roles(Role.Admin)
  @Delete('me/:id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.remove(id, req.user);
    return new ResponseVoucherDto(voucher);
  }
}
