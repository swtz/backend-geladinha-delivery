import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomerService } from 'src/customer/customer.service';
import { AddressService } from 'src/address/address.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { PaymentMethodService } from './services/payment-method.service';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { TipService } from 'src/tip/tip.service';
import relations from './data/relations/delivery';
import {
  DeliveryFindAllFactory,
  DeliveryTaxFactory,
  FindAllParams,
  TotalPurchaseFactory,
} from './factories/query-factory.';
import { DeliveryManService } from 'src/user/services/delivery-man.service';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly userService: UserService,
    private readonly deliveryManService: DeliveryManService,
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
    private readonly tipService: TipService,
  ) {}

  async create(dto: CreateDeliveryDto, user: User) {
    const operator = await this.userService.findOneByOrFail({
      id: user.id,
    });
    const motoboy = await this.deliveryManService.findOneByOrFail(
      {
        user: { id: dto.motoboy },
      },
      true,
    );
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

    const tip = dto.tip
      ? await this.tipService.create(dto.tip, motoboy)
      : undefined;

    const created = {
      description: dto.description,
      totalPurchase: dto.totalPurchase,
      deliveryTax: dto.deliveryTax,
      tip,
      paymentMethod,
      operator,
      motoboy,
      customer,
      address: defaultAddress,
    };

    return this.save(created);
  }

  async update(dto: UpdateDeliveryDto, operator: User, id: string) {
    const delivery = await this.findOneOwnedByOrFail(operator, { id });

    if (dto.motoboy && dto.motoboy !== delivery.motoboy.id) {
      const newMotoboy = await this.deliveryManService.findOneByOrFail({
        user: { id: dto.motoboy },
      });

      if (delivery.tip !== null) {
        await this.tipService.update({
          id: delivery.tip.id,
          motoboy: newMotoboy,
        });
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
        delivery.tip = await this.tipService.create(dto.tip, delivery.motoboy);
      }

      if (dto.tip !== delivery.tip.amount) {
        delivery.tip = await this.tipService.update({
          id: delivery.tip.id,
          amount: dto.tip,
        });
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
      relations,
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
      relations,
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
      relations,
    });

    return delivery;
  }

  async findAll(queryParams: FindAllParams) {
    const queryFactory = new DeliveryFindAllFactory();
    const queryObject = queryFactory.factoryMethod(queryParams);
    const deliveries = await this.deliveryRepository.find({
      where: queryObject,
      order: { createdAt: 'DESC' },
      relations,
    });

    return deliveries;
  }

  async sumDeliveryTaxCol(queryParams: FindAllParams) {
    const queryFactory = new DeliveryTaxFactory();
    const queryObject = queryFactory.factoryMethod(queryParams);
    const total = await this.deliveryRepository.sum('deliveryTax', queryObject);

    if (!total) {
      return 0;
    }

    return setDecimalPlaces(total, 2);
  }

  async sumTotalPurchaseCol(queryParams: FindAllParams) {
    const queryFactory = new TotalPurchaseFactory();
    const queryObject = queryFactory.factoryMethod(queryParams);
    const total = await this.deliveryRepository.sum(
      'totalPurchase',
      queryObject,
    );

    if (!total) {
      return 0;
    }

    return setDecimalPlaces(total, 2);
  }

  async remove(user: User, id: string) {
    const delivery = await this.findOneOwnedByOrFail(user, { id });

    if (delivery.tip !== null) {
      await this.tipService.remove(delivery.tip.id);
    }

    await this.deliveryRepository.delete({ id });
    return delivery;
  }

  async save(delivery: Partial<Delivery>) {
    return await this.deliveryRepository.save(delivery);
  }
}
