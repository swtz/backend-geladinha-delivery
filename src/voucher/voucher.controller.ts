import {
  Body,
  Controller,
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
import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findOneOwned(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voucherService.findOneByDeliveryMan({ id }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    if (req.user instanceof DeliveryManEntity) {
      throw new UnauthorizedException(
        'Somente operador de caixa pode acessar essa rota',
      );
    }

    return this.voucherService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findAllOwned(@Req() req: AuthenticatedRequest) {
    return this.voucherService.findAllOwned({ id: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/:id')
  create(
    @Body() dto: CreateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voucherService.create(dto, req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/:id')
  update(
    @Body() dto: UpdateVoucherDto,
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voucherService.update(dto, req.user, id);
  }
}
