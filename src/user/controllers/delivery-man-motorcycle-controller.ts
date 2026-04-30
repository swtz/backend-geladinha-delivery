import { Controller } from '@nestjs/common';
import { DeliveryManMotorcycleService } from '../services/delivery-man-motorcycle.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';

@Roles(Role.Admin)
@Controller('motoboy')
export class DeliveryManMotorcycleController {
  constructor(
    private readonly deliveryManMotorcycleService: DeliveryManMotorcycleService,
  ) {}
}
