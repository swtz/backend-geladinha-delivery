import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';
import { DataSource } from 'typeorm';
import { UpdateMotorcycleDto } from '../dtos/motorcycle/update-motorcycle.dto';

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
    return this.dataSource.transaction(async manager => {
      const motoboy = await this.deliveryManService.findOneByOrFail(
        { user: { id } },
        false,
        manager,
      );
      motoboy.daily = daily ?? motoboy.daily;

      const motorcycle = await this.motorcycleService.update(
        motoboy.motorcycle.id,
        motorcycleDto,
      );
      await this.deliveryManService.save({ ...motoboy, motorcycle }, manager);
      return this.deliveryManService.findOneByOrFail(
        { user: { id } },
        true,
        manager,
      );
    });
  }

  async updateRestrictMotorcycle(id: string, dto: UpdateMotorcycleDto) {
    return this.dataSource.transaction(async manager => {
      const motorcycle = await this.motorcycleService.findOneByOrFail(
        { id },
        true,
        manager,
      );
      motorcycle.brand = dto.brand ?? motorcycle.brand;
      motorcycle.color = dto.color ?? motorcycle.color;
      motorcycle.model = dto.model ?? motorcycle.model;
      motorcycle.year = dto.year ?? motorcycle.year;
      motorcycle.displacement = dto.displacement ?? motorcycle.displacement;
      motorcycle.isActive = dto.isActive ?? motorcycle.isActive;
      motorcycle.driver = await this.deliveryManService.findOneByOrFail(
        { user: { id: dto.driver } },
        true,
        manager,
      );
      motorcycle.owner = await this.userService.findOneByOrFail(
        { id: dto.owner },
        undefined,
        manager,
      );
      if (dto.licensePlate) {
        await this.motorcycleService.failIfLicensePlateExists(
          dto.licensePlate,
          manager,
        );
        motorcycle.licensePlate = dto.licensePlate;
      }

      const updated = await this.motorcycleService.save(motorcycle, manager);
      return this.motorcycleService.findOneByOrFail(
        { id: updated.id },
        true,
        manager,
      );
    });
  }
}
