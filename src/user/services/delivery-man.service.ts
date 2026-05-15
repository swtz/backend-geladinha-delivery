import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryMan } from '../entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Motorcycle } from '../entities/motorcycle.entity';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';
import {
  DeliveryManType,
  FindDeliveryManByUserDataType,
} from '../types/delivery-man.type';
import { essencial, full } from '../data/relations/delivery-man';

@Injectable()
export class DeliveryManService {
  constructor(
    @InjectRepository(DeliveryMan)
    private readonly deliveryManRepository: Repository<DeliveryMan>,
  ) {}

  async create(dto: CreateDeliveryManDto, user: User, motorcycle: Motorcycle) {
    const deliveryMan: DeliveryManType = {
      daily: dto.daily,
      motorcycle,
      user,
    };

    return this.save(deliveryMan);
  }

  // async updateMotoboyFields(
  //   existsMotoboyData: boolean,
  //   dto: UpdateUserDto,
  //   user: User,
  // ) {
  //   if (!existsMotoboyData) {
  //     throw new BadRequestException('Dados do motoboy não enviados');
  //   }

  //   const motoboy = await this.findOneMotoboyByOrFail({ id: user.id });

  //   // motoboy.motorcycle = dto.motorcycle ?? motoboy.motorcycle;
  //   // MotorcycleService.update()

  //   motoboy.daily = dto.daily ?? motoboy.daily;

  //   return motoboy;
  // }

  async findOneByOrFail(
    userData: FindDeliveryManByUserDataType,
    relations = false,
  ) {
    const motoboy = await this.findOneBy(userData, relations);

    if (!motoboy) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return motoboy;
  }

  async findOneBy(userData: FindDeliveryManByUserDataType, relations = false) {
    const fields = relations ? full : essencial;
    return this.deliveryManRepository.findOne({
      where: userData,
      relations: fields,
    });
  }

  async findAllMotoboy() {
    const motoboys = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: essencial,
    });

    return motoboys;
  }

  async save(deliveryMan: Partial<DeliveryMan>) {
    return this.deliveryManRepository.save(deliveryMan);
  }
}
