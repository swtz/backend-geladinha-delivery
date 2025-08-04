import { Controller } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';

@Controller('delivery-man')
export class DeliveryManController {
  constructor(private readonly deliveryManService: DeliveryManService) {}
}
