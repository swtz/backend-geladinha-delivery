import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
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

  async create(
    dto: CreateDeliveryManDto,
    user: User,
    motorcycle: Motorcycle,
    manager?: EntityManager,
  ) {
    const deliveryMan: DeliveryManType = {
      daily: dto.daily,
      motorcycle,
      user,
    };

    return this.save(deliveryMan, manager);
  }

  async findOneByOrFail(
    userData: FindDeliveryManByUserDataType,
    relations = false,
    manager?: EntityManager,
  ) {
    const motoboy = await this.findOneBy(userData, relations, manager);

    if (!motoboy) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return motoboy;
  }

  async findOneBy(
    userData: FindDeliveryManByUserDataType,
    relations = false,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(DeliveryMan)
      : this.deliveryManRepository;
    const fields = relations ? full : essencial;
    return repo.findOne({
      where: userData,
      relations: fields,
    });
  }

  async findAllMotoboy() {
    const motoboys = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: full,
    });

    return motoboys;
  }

  async save(deliveryMan: Partial<DeliveryMan>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(DeliveryMan)
      : this.deliveryManRepository;
    return repo.save(deliveryMan);
  }
}
