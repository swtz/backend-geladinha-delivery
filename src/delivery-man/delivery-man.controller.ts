import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';
import { UpdateDeliveryManDto } from './dto/update-delivery-man.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('delivery-man')
export class DeliveryManController {
  constructor(private readonly deliveryManService: DeliveryManService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.deliveryManService.findAll();
  }

  @Post()
  create(@Body() dto: CreateDeliveryManDto) {
    return this.deliveryManService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findOne(@Req() req: AuthenticatedRequest) {
    return this.deliveryManService.findOneOrFail({ id: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateDeliveryManDto) {
    return this.deliveryManService.update(dto, req.user.id);
  }
}
