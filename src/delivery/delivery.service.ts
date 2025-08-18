import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryEntity } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryManService } from 'src/delivery-man/delivery-man.service';
import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
    private readonly deliveryManService: DeliveryManService,
  ) {}

  async create(dto: CreateDeliveryDto, operator: UserEntity) {
    if (!(operator instanceof UserEntity)) {
      throw new UnauthorizedException(
        'Somente o operador de caixa pode lançar entregas',
      );
    }

    const motoboy = await this.deliveryManService.findOneOrFail({
      id: dto.motoboy,
    });

    const delivery = this.deliveryRepository.create({
      name: dto.name,
      totalPurchase: dto.totalPurchase,
      deliveryTax: dto.deliveryTax,
      paymentMethod: dto.paymentMethod,
      operator,
      motoboy,
    });

    const created = this.deliveryRepository
      .save(delivery)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar a entrega', err.stack);
        }

        throw new BadRequestException('Erro ao criar a entrega');
      });

    return created;
  }

  async update(
    dto: UpdateDeliveryDto,
    operator: UserEntity,
    deliveryData: Partial<DeliveryEntity>,
  ) {
    if (!(operator instanceof UserEntity)) {
      throw new UnauthorizedException(
        'Somente o operador de caixa pode atualizar entregas',
      );
    }

    const isPaid = dto.paid;
    delete dto['paid'];

    if (Object.keys(dto).length === 0 && isPaid == undefined) {
      throw new BadRequestException('Dados não enviados');
    }

    const delivery = await this.findOneOwnedOrFail(
      { id: deliveryData.id },
      operator,
    );

    const updatedDelivery: DeliveryEntity = {
      ...delivery,
      ...dto,
      paid: isPaid ?? delivery.paid,
    };

    return this.deliveryRepository.save(updatedDelivery);
  }

  async remove(operator: UserEntity, deliveryData: Partial<DeliveryEntity>) {
    if (!(operator instanceof UserEntity)) {
      throw new UnauthorizedException(
        'Somente o operador de caixa pode remover entregas',
      );
    }

    const delivery = await this.findOneOwnedOrFail(deliveryData, operator);

    await this.deliveryRepository.delete({
      ...deliveryData,
      operator: { id: operator.id },
    });

    return delivery;
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
    user: UserEntity | DeliveryManEntity,
  ) {
    const queryObject =
      user instanceof UserEntity
        ? { operator: { id: user.id } }
        : { motoboy: { id: user.id } };

    const ownedDelivery = await this.deliveryRepository.findOne({
      where: {
        ...deliveryData,
        ...queryObject,
      },
      relations: ['operator', 'motoboy'],
    });

    return ownedDelivery;
  }

  async findAllOwned(operator: UserEntity) {
    const deliveries = await this.deliveryRepository.find({
      where: {
        operator: { id: operator.id },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['operator', 'motoboy'],
    });

    return deliveries;
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
      relations: ['operator', 'motoboy'],
    });

    return delivery;
  }

  async findAll() {
    const deliveries = await this.deliveryRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['operator', 'motoboy'],
    });

    return deliveries;
  }

  async findAllPaid(paid: boolean) {
    const paidDeliveries = await this.deliveryRepository.find({
      where: { paid },
      order: { createdAt: 'DESC' },
      relations: ['operator', 'motoboy'],
    });

    return paidDeliveries;
  }
}
