import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomerService } from 'src/customer/customer.service';
import { AddressService } from 'src/address/address.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { PaymentMethodService } from './services/payment-method.service';
import { setDecimalPlaces } from 'src/common/set-decimal-places';
import { TipService } from 'src/tip/tip.service';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
    private readonly tipService: TipService,
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
    const paymentMethod = await this.paymentMethodService.findOneOrCreate(
      dto.paymentMethod,
    );

    const created = await this.save({
      description: dto.description,
      totalPurchase: dto.totalPurchase,
      deliveryTax: dto.deliveryTax,
      operator,
      motoboy,
      customer,
      address: defaultAddress,
    });
    const delivery = await this.findOneByOrFail({ id: created.id });

    delivery.paymentMethod = paymentMethod;

    if (dto.tip) {
      await this.tipService.createReplaceAndPush(dto.tip, delivery, motoboy);
      await this.userService.saveDeliveryMan(motoboy);
    }

    return this.save(delivery);
  }

  async update(dto: UpdateDeliveryDto, operator: User, id: string) {
    const delivery = await this.findOneOwnedByOrFail(operator, { id });

    if (dto.motoboy && dto.motoboy !== delivery.motoboy.id) {
      const newMotoboy = await this.userService.findOneMotoboyByOrFail({
        id: dto.motoboy,
      });

      if (delivery.tip !== null) {
        await this.tipService.remove(delivery.tip.id);
        await this.tipService.createReplaceAndPush(
          delivery.tip.amount,
          delivery,
          newMotoboy,
        );
        await this.userService.saveDeliveryMan(newMotoboy);
      }

      delivery.motoboy = newMotoboy;
    }

    if (
      dto.address &&
      dto.customer === delivery.customer.id &&
      dto.address !== delivery.address.id
    ) {
      const newOwnedAddress = await this.addressService.findOneOwnedOrFail(
        { id: dto.address },
        { id: delivery.customer.id },
      );
      delivery.address = newOwnedAddress;
    }

    if (dto.customer && dto.customer !== delivery.customer.id) {
      const newCustomer = await this.customerService.findOneByOrFail({
        id: dto.customer,
      });
      const newDefaultAddress = await this.addressService.findOneOwnedOrFail(
        { isDefault: true },
        { id: dto.customer },
      );

      delivery.customer = newCustomer;
      delivery.address = newDefaultAddress;
    }

    if (
      dto.paymentMethod &&
      dto.paymentMethod !== delivery.paymentMethod.name
    ) {
      const newPaymentMethod = await this.paymentMethodService.findOneOrCreate(
        dto.paymentMethod,
      );

      delivery.paymentMethod = newPaymentMethod;
    }

    if (dto.tip || dto.tip === 0) {
      if (delivery.tip === null) {
        await this.tipService.createReplaceAndPush(
          dto.tip,
          delivery,
          delivery.motoboy,
        );

        await this.userService.saveDeliveryMan(delivery.motoboy);
      }

      if (dto.tip !== delivery.tip.amount) {
        const tip = await this.tipService.findOneByOrFail({
          id: delivery.tip.id,
          motoboy: delivery.motoboy,
        });
        const newTip = await this.tipService.update(tip.id, dto.tip);

        delivery.tip = newTip;
      }
    }

    delivery.isPaid = dto.isPaid ?? delivery.isPaid;
    delivery.deliveryTax = dto.deliveryTax ?? delivery.deliveryTax;
    delivery.description = dto.description ?? delivery.description;
    delivery.totalPurchase = dto.totalPurchase ?? delivery.totalPurchase;

    return this.save(delivery);
  }

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
      relations: [
        'operator',
        'motoboy',
        'motoboy.tips',
        'customer',
        'address',
        'paymentMethod',
        'tip',
      ],
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
      relations: [
        'operator',
        'motoboy',
        'customer',
        'address',
        'paymentMethod',
        'tip',
      ],
    });

    return deliveries;
  }

  async findOneByOrFail(deliveryData: Partial<Delivery>) {
    const delivery = await this.findOneBy(deliveryData);

    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return delivery;
  }

  async findOneBy(deliveryData: Partial<Delivery>) {
    const delivery = await this.deliveryRepository.findOne({
      where: deliveryData,
      relations: [
        'operator',
        'motoboy',
        'customer',
        'address',
        'paymentMethod',
        'tip',
      ],
    });

    return delivery;
  }

  async findAll({
    customer,
    motoboy,
    operator,
    isPaid,
    fromDate,
    toDate,
  }: {
    customer?: string;
    motoboy?: string;
    operator?: string;
    isPaid?: boolean;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const queryObject = {
      customer: { name: customer },
      motoboy: { name: motoboy },
      operator: { name: operator },
      isPaid,
    };

    if (fromDate !== undefined && toDate !== undefined) {
      queryObject['createdAt'] = Between(fromDate, toDate);
    }

    const deliveries = await this.deliveryRepository.find({
      where: queryObject,
      order: { createdAt: 'DESC' },
      relations: [
        'operator',
        'motoboy',
        'customer',
        'address',
        'paymentMethod',
        'tip',
      ],
    });

    return deliveries;
  }

  async sumDeliveryTaxCol(user?: User, fromDate?: Date, toDate?: Date) {
    const queryObject = {};

    if (user) {
      queryObject['motoboy'] = { id: user.id };
    }

    if (fromDate !== undefined && toDate !== undefined) {
      queryObject['createdAt'] = Between(fromDate, toDate);
    }

    const total = await this.deliveryRepository.sum('deliveryTax', queryObject);

    if (!total) {
      return 0;
    }

    return setDecimalPlaces(total, 2);
  }

  async remove(user: User, id: string) {
    const delivery = await this.findOneOwnedByOrFail(user, { id });
    await this.deliveryRepository.delete({ id });
    return delivery;
  }

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
