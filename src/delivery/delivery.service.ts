import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomerService } from 'src/customer/customer.service';
import { AddressService } from 'src/address/address.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
  ) {}

  async create(dto: CreateDeliveryDto, user: User) {
    const operator = await this.userService.findOneByOrFail({
      id: user.id,
    });
    const motoboy = await this.userService.findOneMotoboyByOrFail({
      id: dto.motoboy,
    });
    const customer = await this.customerService.findOneByOrFail({
      id: dto.customer,
    });
    const defaultAddress = await this.addressService.findOneOwnedOrFail(
      { isDefault: true },
      { id: dto.customer },
    );

    const delivery = this.deliveryRepository.create({
      description: dto.description,
      totalPurchase: dto.totalPurchase,
      deliveryTax: dto.deliveryTax,
      paymentMethod: dto.paymentMethod,
      operator,
      motoboy,
      customer,
      address: defaultAddress,
    });

    return this.save(delivery);
  }

  async update(dto: UpdateDeliveryDto, operator: User, id: string) {
    // const isPaid = dto.paid;
    // delete dto['paid'];

    // if (Object.keys(dto).length === 0 && isPaid == undefined) {
    //   throw new BadRequestException('Dados não enviados');
    // }

    const delivery = await this.findOneOwnedByOrFail(operator, { id });

    if (dto.motoboy) {
      const newMotoboy = await this.userService.findOneMotoboyByOrFail({
        id: dto.motoboy,
      });

      delivery.motoboy = newMotoboy;
    }

    if (dto.customer) {
      const newCustomer = await this.customerService.findOneByOrFail({
        id: dto.customer,
      });

      delivery.customer = newCustomer;
    }

    const updatedDelivery: Delivery = {
      ...delivery,
      paid: dto.paid ?? delivery.paid,
    };

    return updatedDelivery;
  }

  // async remove(operator: User, deliveryData: Partial<DeliveryEntity>) {
  //   if (!(operator instanceof User)) {
  //     throw new UnauthorizedException(
  //       'Somente o operador de caixa pode remover entregas',
  //     );
  //   }

  //   const delivery = await this.findOneOwnedByOrFail(deliveryData, operator);

  //   await this.deliveryRepository.delete({
  //     ...deliveryData,
  //     operator: { id: operator.id },
  //   });

  //   return delivery;
  // }

  async findOneOwnedByOrFail(user: User, deliveryData: Partial<Delivery>) {
    const delivery = await this.findOneOwnedBy(user, deliveryData);

    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return delivery;
  }

  async findOneOwnedBy(user: User, deliveryData: Partial<Delivery>) {
    const { isLoggedUserMotoboy } = await this.userService.getUserAndEntityAuth(
      user,
      user.id,
    );
    const queryObject = isLoggedUserMotoboy
      ? { motoboy: { id: user.id } }
      : { operator: { id: user.id } };

    const delivery = await this.deliveryRepository.findOne({
      where: {
        ...deliveryData,
        ...queryObject,
      },
      relations: ['operator', 'motoboy', 'customer', 'address'],
    });

    return delivery;
  }

  async findAllOwned(user: User) {
    const { isLoggedUserMotoboy } = await this.userService.getUserAndEntityAuth(
      user,
      user.id,
    );
    const queryObject = isLoggedUserMotoboy
      ? { motoboy: { id: user.id } }
      : { operator: { id: user.id } };

    const deliveries = await this.deliveryRepository.find({
      where: queryObject,
      order: {
        createdAt: 'DESC',
      },
      relations: ['operator', 'motoboy', 'customer', 'address'],
    });

    return deliveries;
  }

  // async findOneOrFail(deliveryData: Partial<DeliveryEntity>) {
  //   const delivery = await this.findOne(deliveryData);

  //   if (!delivery) {
  //     throw new NotFoundException('Entrega não encontrada');
  //   }

  //   return delivery;
  // }

  // async findOne(deliveryData: Partial<DeliveryEntity>) {
  //   const delivery = await this.deliveryRepository.findOne({
  //     where: deliveryData,
  //     relations: ['operator', 'motoboy'],
  //   });

  //   return delivery;
  // }

  // async findAll() {
  //   const deliveries = await this.deliveryRepository.find({
  //     order: { createdAt: 'DESC' },
  //     relations: ['operator', 'motoboy'],
  //   });

  //   return deliveries;
  // }

  // async findAllPaid(paid: boolean) {
  //   const paidDeliveries = await this.deliveryRepository.find({
  //     where: { paid },
  //     order: { createdAt: 'DESC' },
  //     relations: ['operator', 'motoboy'],
  //   });

  //   return paidDeliveries;
  // }

  async save(delivery: Partial<Delivery>) {
    const created = await this.deliveryRepository
      .save(delivery)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar a entrega', err.stack);
        }
        throw new BadRequestException('Erro ao criar a entrega');
      });

    return created;
  }
}
