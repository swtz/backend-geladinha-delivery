import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';

@Injectable()
export class DeliveryManMotorcycleService {
  constructor(
    private readonly userService: UserService,
    private readonly deliveryManService: DeliveryManService,
    private readonly motorcycleService: MotorcycleService,
  ) {}

  async create(
    userDto: CreateUserDto,
    deliveryManDto: CreateDeliveryManDto,
    motorcycleDto: CreateMotorcycleDto,
  ) {
    const user = await this.userService.create(userDto);
    const owner = motorcycleDto.owner
      ? await this.userService.findOneByOrFail({
          id: motorcycleDto.owner,
        })
      : undefined;

    const motorcycle = await this.motorcycleService.create(
      motorcycleDto,
      owner,
    );

    const motoboy = await this.deliveryManService.create(
      deliveryManDto,
      user,
      motorcycle,
    );

    await this.motorcycleService.save({ ...motorcycle, driver: motoboy });

    return this.userService.findOneByOrFail({ id: user.id }, 'motoboy-full');
  }
}
