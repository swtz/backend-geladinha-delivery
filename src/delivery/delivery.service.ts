import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOptionsOrder,
  FindOptionsOrderValue,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/services/user.service';
import { CustomerService } from 'src/customer/services/customer.service';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDeliveryDto, user: User) {
    return this.dataSource.transaction(async manager => {
      const operator = await this.userService.findOneByOrFail(
        { id: user.id },
        undefined,
        manager,
      );
      const motoboy = dto.motoboy
        ? await this.deliveryManService.findOneByOrFail(
            { user: { id: dto.motoboy } },
            true,
            manager,
          )
        : null;
      if (motoboy && !motoboy.motorcycle) {
        throw new UnprocessableEntityException(
          `O motoboy ${motoboy.user.name} não possui uma moto cadastrada`,
        );
      }

      const customer = dto.customer
        ? await this.customerService.findOneByOrFail(
            { id: dto.customer },
            manager,
          )
        : null;
      const defaultAddress = dto.customer
        ? await this.addressService.findOneOwnedOrFail(
            { isDefault: true },
            { id: dto.customer },
            manager,
          )
        : null;
      const paymentMethod = await this.paymentMethodService.findOneOrCreate(
        dto.paymentMethod,
        manager,
      );
      const tip =
        dto.tip && motoboy
          ? await this.tipService.create(dto.tip, motoboy, manager)
          : undefined;

      const delivery = {
        description: dto.description,
        totalPurchase: dto.totalPurchase,
        deliveryTax: dto.deliveryTax,
        motorcycleLicensePlate:
          motoboy && motoboy.motorcycle
            ? motoboy.motorcycle.licensePlate
            : null,
        tip,
        paymentMethod,
        operator,
        motoboy,
        customer,
        address: defaultAddress,
        placeCode: dto.placeCode,
        change: dto.change,
      };
      const created = await this.save(delivery, manager);
      return this.findOneByOrFail({ id: created.id }, manager);
    });
  }

  async update(dto: UpdateDeliveryDto, operator: User, id: string) {
    return this.dataSource.transaction(async manager => {
      const delivery = await this.findOneOwnedByOrFail(
        operator,
        { id },
        manager,
      );

      if (dto.motoboy) {
        if (!delivery.motoboy || dto.motoboy !== delivery.motoboy.id) {
          const newMotoboy = await this.deliveryManService.findOneByOrFail(
            { user: { id: dto.motoboy } },
            false,
            manager,
          );

          if (delivery.tip !== null) {
            await this.tipService.update(
              {
                id: delivery.tip.id,
                motoboy: newMotoboy,
              },
              manager,
            );
          }

          delivery.motoboy = newMotoboy;
        }
      }

      if (dto.address && delivery.customer) {
        if (!delivery.address || dto.address !== delivery.address.id) {
          const customerId = dto.customer ? dto.customer : delivery.customer.id;
          const newOwnedAddress = await this.addressService.findOneOwnedOrFail(
            { id: dto.address },
            { id: customerId },
            manager,
          );
          delivery.address = newOwnedAddress;
        }
      }

      if (dto.customer) {
        if (!delivery.customer || dto.customer !== delivery.customer.id) {
          const newCustomer = await this.customerService.findOneByOrFail(
            { id: dto.customer },
            manager,
          );
          const newDefaultAddress =
            await this.addressService.findOneOwnedOrFail(
              { isDefault: true },
              { id: dto.customer },
              manager,
            );

          delivery.customer = newCustomer;
          delivery.address = newDefaultAddress;
        }
      }

      if (dto.paymentMethod) {
        if (
          !delivery.paymentMethod ||
          dto.paymentMethod !== delivery.paymentMethod.name
        ) {
          const newPaymentMethod =
            await this.paymentMethodService.findOneOrCreate(
              dto.paymentMethod,
              manager,
            );

          delivery.paymentMethod = newPaymentMethod;
        }
      }

      if (delivery.motoboy) {
        if (dto.tip || dto.tip === 0) {
          if (delivery.tip === null) {
            delivery.tip = await this.tipService.create(
              dto.tip,
              delivery.motoboy,
              manager,
            );
          } else {
            delivery.tip = await this.tipService.update(
              {
                id: delivery.tip.id,
                amount: dto.tip,
              },
              manager,
            );
          }
        }
      }

      delivery.isPaid = dto.isPaid ?? delivery.isPaid;
      delivery.deliveryTax = dto.deliveryTax ?? delivery.deliveryTax;
      delivery.description = dto.description ?? delivery.description;
      delivery.totalPurchase = dto.totalPurchase ?? delivery.totalPurchase;
      delivery.placeCode = dto.placeCode ?? delivery.placeCode;
      delivery.change = dto.change ?? delivery.change;

      return this.save(delivery, manager);
    });
  }

  async attachTo(motoboy: User, id: string) {
    const user = await this.userService.findOneByOrFail(
      { id: motoboy.id },
      'motoboy-essencial',
    );
    const delivery = await this.findOneByOrFail({ id });
    if (!user.deliveryMan) {
      throw new ForbiddenException('Acesso negado');
    }
    if (!user.deliveryMan.motorcycle) {
      throw new UnprocessableEntityException(
        'Você precisa ter uma moto cadastrada',
      );
    }
    delivery.motoboy = user.deliveryMan;
    delivery.motorcycleLicensePlate = user.deliveryMan.motorcycle.licensePlate;

    const updated = await this.save(delivery);
    return this.findOneByOrFail({ id: updated.id });
  }

  async findOneOwnedByOrFail(
    user: User,
    deliveryData: FindOptionsWhere<Delivery>,
    manager?: EntityManager,
  ) {
    const delivery = await this.findOneOwnedBy(user, deliveryData, manager);

    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return delivery;
  }

  async findOneOwnedBy(
    user: User,
    deliveryData: FindOptionsWhere<Delivery>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Delivery)
      : this.deliveryRepository;
    const { isLoggedUserMotoboy } = await this.userService.getUserAndEntityAuth(
      user,
      user.id,
    );
    const queryObject: FindOptionsWhere<Delivery> = isLoggedUserMotoboy
      ? { motoboy: { id: user.id } }
      : { operator: { id: user.id } };

    const delivery = await repo.findOne({
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

  async findOneByOrFail(
    deliveryData: FindOptionsWhere<Delivery>,
    manager?: EntityManager,
  ) {
    const delivery = await this.findOneBy(deliveryData, manager);

    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return delivery;
  }

  async findOneBy(
    deliveryData: FindOptionsWhere<Delivery>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Delivery)
      : this.deliveryRepository;
    const delivery = await repo.findOne({
      where: deliveryData,
      relations,
    });

    return delivery;
  }

  async findAll(
    queryParams: FindAllParams,
    orderParams?: {
      [K in keyof FindOptionsOrder<Delivery>]: FindOptionsOrderValue;
    },
  ) {
    const queryFactory = new DeliveryFindAllFactory();
    const queryObject = queryFactory.factoryMethod(queryParams);
    const deliveries = await this.deliveryRepository.find({
      where: queryObject,
      order: orderParams,
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
    return this.dataSource.transaction(async manager => {
      const delivery = await this.findOneOwnedByOrFail(user, { id }, manager);
      if (delivery.tip !== null) {
        await this.tipService.remove(delivery.tip.id, manager);
      }
      await this.deliveryRepository.delete({ id });
      return delivery;
    });
  }

  async save(delivery: Partial<Delivery>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Delivery)
      : this.deliveryRepository;
    return repo.save(delivery);
  }
}
