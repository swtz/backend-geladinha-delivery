import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomerService } from 'src/customer/customer.service';
import { AddressService } from 'src/address/address.service';

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

  async create(dto: CreateDeliveryDto, operator: User) {
    const motoboy = await this.userService.findOneMotoboyByOrFail({
      id: dto.motoboy,
    });

    // const delivery = this.deliveryRepository.create({
    //   name: dto.name,
    //   totalPurchase: dto.totalPurchase,
    //   deliveryTax: dto.deliveryTax,
    //   paymentMethod: dto.paymentMethod,
    //   operator,
    //   motoboy,
    // });
    // const created = this.deliveryRepository
    //   .save(delivery)
    //   .catch((err: unknown) => {
    //     if (err instanceof Error) {
    //       this.logger.error('Erro ao criar a entrega', err.stack);
    //     }
    //     throw new BadRequestException('Erro ao criar a entrega');
    //   });
    return motoboy;
  }

  // async update(
  //   dto: UpdateDeliveryDto,
  //   operator: User,
  //   deliveryData: Partial<DeliveryEntity>,
  // ) {
  //   if (!(operator instanceof User)) {
  //     throw new UnauthorizedException(
  //       'Somente o operador de caixa pode atualizar entregas',
  //     );
  //   }

  //   const isPaid = dto.paid;
  //   delete dto['paid'];

  //   if (Object.keys(dto).length === 0 && isPaid == undefined) {
  //     throw new BadRequestException('Dados não enviados');
  //   }

  //   const delivery = await this.findOneOwnedByOrFail(
  //     { id: deliveryData.id },
  //     operator,
  //   );

  //   const updatedDelivery: DeliveryEntity = {
  //     ...delivery,
  //     ...dto,
  //     paid: isPaid ?? delivery.paid,
  //   };

  //   return this.deliveryRepository.save(updatedDelivery);
  // }

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

  // async findOneOwnedByOrFail(
  //   deliveryData: Partial<DeliveryEntity>,
  //   user: User | DeliveryMan,
  // ) {
  //   const ownedDelivery = await this.findOneOwnedBy(deliveryData, user);

  //   if (!ownedDelivery) {
  //     throw new NotFoundException('Entrega não encontrada');
  //   }

  //   return ownedDelivery;
  // }

  // async findOneOwnedBy(
  //   deliveryData: Partial<DeliveryEntity>,
  //   user: User | DeliveryMan,
  // ) {
  //   const queryObject =
  //     user instanceof User
  //       ? { operator: { id: user.id } }
  //       : { motoboy: { id: user.id } };

  //   const ownedDelivery = await this.deliveryRepository.findOne({
  //     where: {
  //       ...deliveryData,
  //       ...queryObject,
  //     },
  //     relations: ['operator', 'motoboy'],
  //   });

  //   return ownedDelivery;
  // }

  // async findAllOwnedBy(user: User | DeliveryMan) {
  //   const queryObject =
  //     user instanceof User
  //       ? { operator: { id: user.id } }
  //       : { motoboy: { id: user.id } };

  //   const deliveries = await this.deliveryRepository.find({
  //     where: {
  //       ...queryObject,
  //     },
  //     order: {
  //       createdAt: 'DESC',
  //     },
  //     relations: ['operator', 'motoboy'],
  //   });

  //   return deliveries;
  // }

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
}
