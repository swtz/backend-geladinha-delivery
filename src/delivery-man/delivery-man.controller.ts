import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';

@Controller('delivery-man')
export class DeliveryManController {
  constructor(private readonly deliveryManService: DeliveryManService) {}

  @Post()
  create(@Body() dto: CreateDeliveryManDto) {
    return this.deliveryManService.create(dto);
  }
}
