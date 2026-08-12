import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';
import { DataSource } from 'typeorm';
import { UpdateMotorcycleDto } from '../dtos/motorcycle/update-motorcycle.dto';
import { Motorcycle } from '../entities/motorcycle.entity';

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
    motorcycleData: CreateMotorcycleDto | string,
  ) {
    return this.dataSource.transaction(async manager => {
      const isObject = typeof motorcycleData === 'object';
      const user = await this.userService.create(userDto, manager);
      const ownerId: string | undefined = isObject
        ? motorcycleData['owner']
        : undefined;

      const owner = ownerId
        ? await this.userService.findOneByOrFail({ id: ownerId })
        : undefined;

      const motorcycle =
        typeof motorcycleData === 'object'
          ? await this.motorcycleService.create(
              motorcycleData,
              owner,
              undefined,
              manager,
            )
          : await this.motorcycleService.findOneByOrFail(
              { id: motorcycleData },
              true,
              manager,
            );

      const oldDeliveryMan = await this.deliveryManService.findOneBy(
        { motorcycle: { id: motorcycle.id } },
        false,
        manager,
      );
      if (oldDeliveryMan) {
        await manager
          .createQueryBuilder()
          .relation(Motorcycle, 'driver')
          .of(motorcycle.id)
          .set(null);
      }

      const deliveryMan = await this.deliveryManService.create(
        deliveryManDto,
        user,
        motorcycle,
        manager,
      );

      await this.motorcycleService.save(
        {
          ...motorcycle,
          owner: !owner ? user : undefined,
          driver: deliveryMan,
        },
        manager,
      );

      return this.userService.findOneByOrFail(
        { id: user.id },
        undefined,
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
        manager,
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
      motorcycle.driver = dto.driver
        ? await this.deliveryManService.findOneByOrFail(
            { user: { id: dto.driver } },
            true,
            manager,
          )
        : motorcycle.driver;

      motorcycle.owner = dto.owner
        ? await this.userService.findOneByOrFail(
            { id: dto.owner },
            undefined,
            manager,
          )
        : motorcycle.owner;

      if (dto.licensePlate) {
        await this.motorcycleService.failIfLicensePlateExists(
          dto.licensePlate,
          manager,
        );
        motorcycle.licensePlate = dto.licensePlate ?? motorcycle.licensePlate;
      }
      motorcycle.placeCode = dto.placeCode ?? motorcycle.placeCode;

      const updated = await this.motorcycleService.save(motorcycle, manager);
      return this.motorcycleService.findOneByOrFail(
        { id: updated.id },
        true,
        manager,
      );
    });
  }
}
