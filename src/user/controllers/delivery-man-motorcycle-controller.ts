import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryManMotorcycleService } from '../services/delivery-man-motorcycle.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';

@Roles(Role.Admin)
@Controller('motoboy')
export class DeliveryManMotorcycleController {
  constructor(
    private readonly deliveryManMotorcycleService: DeliveryManMotorcycleService,
  ) {}

  @Post()
  async create(
    @Body('user') userDto: CreateUserDto,
    @Body('motorcycle') motorcycleDto: CreateMotorcycleDto,
    @Body('deliveryMan') deliveryManDto: CreateDeliveryManDto,
  ) {
    const deliveryMan = await this.deliveryManMotorcycleService.create(
      userDto,
      deliveryManDto,
      motorcycleDto,
    );

    return deliveryMan;
  }
}
