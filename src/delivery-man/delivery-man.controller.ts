import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';
import { UpdateDeliveryManDto } from './dto/update-delivery-man.dto';

@Controller('delivery-man')
export class DeliveryManController {
  constructor(private readonly deliveryManService: DeliveryManService) {}

  @Post()
  create(@Body() dto: CreateDeliveryManDto) {
    return this.deliveryManService.create(dto);
  }

  @Patch(':id')
  update(
    @Body() dto: UpdateDeliveryManDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deliveryManService.update(dto, id);
  }
}
