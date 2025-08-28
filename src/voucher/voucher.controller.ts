import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Roles(Role.Operator, Role.Motoboy, Role.Admin)
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  @Roles(Role.Admin, Role.Operator)
  async findByUser(@Param('id', ParseUUIDPipe) id: string) {
    const vouchers = await this.voucherService.findByUser(id);
    return vouchers;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const vouchers = await this.voucherService.findAllOwned(req.user);
    return vouchers;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles(Role.Admin, Role.Operator)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const voucher = await this.voucherService.findOneByOrFail({ id });
    return voucher;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async create(
    @Body() dto: CreateVoucherDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const voucher = await this.voucherService.create(dto, req.user);
    return voucher;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/user/:id')
  @Roles(Role.Admin, Role.Operator)
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
    return voucher;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/:id')
  async update(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const voucher = await this.voucherService.update(dto, req.user, id);
    return voucher;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/user/:id')
  @Roles(Role.Admin, Role.Operator)
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
    return voucher;
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete('me/:id')
  // async remove(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const voucher = await this.voucherService.remove(id, req.user);
  //   return new ResponseVoucherDto(voucher);
  // }
}
