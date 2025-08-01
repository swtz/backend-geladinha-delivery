import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryEntity } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  create(dto: CreateDeliveryDto, operator: UserEntity) {
    const delivery = this.deliveryRepository.create({
      name: dto.name,
      totalPurchase: dto.totalPurchase,
      deliveryTax: dto.deliveryTax,
      paymentMethod: dto.paymentMethod,
      operator,
    });

    const created = this.deliveryRepository
      .save(delivery)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o post', err.stack);
        }

        throw new BadRequestException('Erro ao criar o post');
      });

    return created;
  }

  async findOneOwnedOrFail(
    deliveryData: Partial<DeliveryEntity>,
    operator: UserEntity,
  ) {
    const ownedDelivery = await this.findOneOwned(deliveryData, operator);

    if (!ownedDelivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return ownedDelivery;
  }

  async findOneOwned(
    deliveryData: Partial<DeliveryEntity>,
    operator: UserEntity,
  ) {
    const ownedDelivery = await this.deliveryRepository.findOne({
      where: {
        ...deliveryData,
        operator: { id: operator.id },
      },
      relations: ['operator'],
    });

    return ownedDelivery;
  }

  async findOneOrFail(deliveryData: Partial<DeliveryEntity>) {
    const delivery = await this.findOne(deliveryData);

    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return delivery;
  }

  async findOne(deliveryData: Partial<DeliveryEntity>) {
    const delivery = await this.deliveryRepository.findOne({
      where: deliveryData,
      relations: ['operator'],
    });

    return delivery;
  }
}
