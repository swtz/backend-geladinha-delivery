import {
  Body,
  Controller,
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
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

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
