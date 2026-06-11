import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class DeliveryManMotorcycleService {
  constructor(
    private readonly userService: UserService,
    private readonly deliveryManService: DeliveryManService,
    private readonly motorcycleService: MotorcycleService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userDto: CreateUserDto,
    deliveryManDto: CreateDeliveryManDto,
    motorcycleDto: CreateMotorcycleDto,
  ) {
    return this.dataSource.transaction(async manager => {
      const user = await this.userService.create(userDto, manager); // TRANSACTIONS

      const owner = motorcycleDto.owner
        ? await this.userService.findOneByOrFail(
            { id: motorcycleDto.owner },
            undefined,
            manager,
          )
        : undefined;

      const motorcycle = await this.motorcycleService.create(
        motorcycleDto,
        owner,
        undefined,
        manager,
      );

      const motoboy = await this.deliveryManService.create(
        deliveryManDto,
        user,
        motorcycle,
        manager,
      );

      await this.motorcycleService.save(
        { ...motorcycle, driver: motoboy },
        manager,
      );

      return this.userService.findOneByOrFail(
        { id: user.id },
        'motoboy-full',
        manager,
      );
    });
  }

  async update(id: string, motorcycleDto: UpdateMotorcycleDto, daily?: number) {
    const motoboy = await this.deliveryManService.findOneByOrFail({
      user: { id },
    });
    const motorcycle = await this.motorcycleService.update(motorcycleDto);
    motoboy.daily = daily ?? motoboy.daily;
    return motoboy;
  }
}
