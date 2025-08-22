import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { DeliveryMan } from 'src/delivery-man/entities/delivery-man.entity';
import { ResponseVoucherDto } from './dto/response-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get('me/:id')
  // async findOneOwned(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const ownedVoucher = await this.voucherService.findOneByDeliveryMan(
  //     { id },
  //     req.user,
  //   );
  //   return new ResponseVoucherDto(ownedVoucher);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(@Req() req: AuthenticatedRequest) {
  //   if (req.user instanceof DeliveryMan) {
  //     throw new UnauthorizedException(
  //       'Somente operador de caixa pode acessar essa rota',
  //     );
  //   }

  //   const vouchers = await this.voucherService.findAll();
  //   const arrayVouchers = vouchers.map(
  //     voucher => new ResponseVoucherDto(voucher),
  //   );
  //   return arrayVouchers;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async findAllOwned(@Req() req: AuthenticatedRequest) {
  //   const vouchers = await this.voucherService.findAllOwned({
  //     id: req.user.id,
  //   });
  //   const arrayVouchers = vouchers.map(
  //     voucher => new ResponseVoucherDto(voucher),
  //   );
  //   return arrayVouchers;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('me/:id')
  // async create(
  //   @Body() dto: CreateVoucherDto,
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const voucher = await this.voucherService.create(dto, req.user, id);
  //   return new ResponseVoucherDto(voucher);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me/:id')
  // async update(
  //   @Body() dto: UpdateVoucherDto,
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const voucher = await this.voucherService.update(dto, req.user, id);
  //   return new ResponseVoucherDto(voucher);
  // }

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
