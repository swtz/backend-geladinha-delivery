import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FindOptionsOrder,
  Repository,
  FindOptionsOrderValue,
  FindOptionsWhere,
} from 'typeorm';
import { Settlement } from './entities/settlement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';
import { UserService } from 'src/user/services/user.service';
import { VoucherService } from 'src/voucher/voucher.service';
import { User } from 'src/user/entities/user.entity';
import { weekDays } from 'src/common/enums/weekDays.enum';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { PaymentMethod } from 'src/delivery/enums/payment-methods.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { Role } from 'src/common/role/roles.enum';
import { Voucher } from 'src/voucher/enums/voucher.enum';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';
import { getUnixTime } from 'date-fns';
import { ResponsePreviewSettlement } from './types/response-preview-settlement.type';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly deliveryService: DeliveryService,
    private readonly voucherService: VoucherService,
    private readonly userService: UserService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  async preview(
    userData: FindOptionsWhere<User>,
    from: Date,
    to: Date,
  ): Promise<ResponsePreviewSettlement> {
    const operator = await this.userService.findOneByOrFail(
      userData,
      'motoboy-essencial',
    );

    if (operator.deliveryMan) {
      throw new UnprocessableEntityException(
        'Motoboys não possuem caixa para fechar',
      );
    }

    const exists = await this.findOneByWorkDayAndOperator({
      workDay: from,
      operator: { id: operator.id },
    });

    const vouchers = await this.voucherService.findAll({
      from,
      to,
      type: Voucher.User,
      userData,
    });
    const deliveries = await this.deliveryService.findAll({
      from,
      to,
      type: Role.Operator,
      userData,
    });

    const settlement = {
      weekDay: weekDays[from.getDay()],
      workDay: from,
      initValue: exists !== null ? exists.initValue : undefined,
      quantityDeliveries: deliveries.length,
      totalRemainingMotoboy: 0,
      subtotal: 0,
      moneySubtotal: 0,
      cardSubtotal: 0,
      pixSubtotal: 0,
      currentTotal: exists !== null ? exists.currentTotal : 0,
      expectedTotal: exists !== null ? exists.expectedTotal : 0,
      description: exists !== null ? exists.description : undefined,
      operator,
      vouchers,
    };

    const generatePrefix = (name: PaymentMethod) => {
      const prefix =
        name === PaymentMethod.Credit || name === PaymentMethod.Debit
          ? 'card'
          : name;
      return prefix;
    };

    function sumPaymentMethodSubtotal(
      prefix: PaymentMethod | 'card',
      value: number,
    ) {
      const prop = `${prefix}Subtotal`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      settlement[prop] = setDecimalPlaces(settlement[prop] + value, 2);
    }

    if (deliveries.length > 1) {
      settlement.subtotal = await this.deliveryService.sumTotalPurchaseCol({
        userData,
        from,
        to,
      });

      deliveries.forEach(delivery => {
        const { name } = delivery.paymentMethod;
        sumPaymentMethodSubtotal(generatePrefix(name), delivery.totalPurchase);
      });
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;
      const { name } = delivery.paymentMethod;

      sumPaymentMethodSubtotal(generatePrefix(name), delivery.totalPurchase);
      settlement.subtotal = delivery.totalPurchase;
    }

    settlement.totalRemainingMotoboy =
      await this.deliveryService.sumTotalPurchaseCol({
        userData,
        from,
        to,
        isPaid: false,
      });

    const currentTotal = setDecimalPlaces(
      settlement.subtotal - settlement.totalRemainingMotoboy,
      2,
    );
    const expectedTotal = setDecimalPlaces(
      currentTotal + settlement.totalRemainingMotoboy,
      2,
    );

    if (exists) {
      settlement.currentTotal = setDecimalPlaces(
        exists.initValue + currentTotal,
        2,
      );

      settlement.expectedTotal = setDecimalPlaces(
        exists.initValue + expectedTotal,
        2,
      );

      return settlement;
    }

    settlement.currentTotal += currentTotal;
    settlement.expectedTotal += expectedTotal;

    return settlement;
  }

  async create(
    settlementData: ResponsePreviewSettlement,
    initValue: number,
    placeCode: string,
    description?: string,
  ) {
    const exists = await this.findOneByWorkDayAndOperator({
      workDay: settlementData.workDay,
      operator: { id: settlementData.operator.id },
    });

    if (exists) {
      throw new ConflictException(
        `Já foi criado um caixa para esse dia.\nOperador: ${exists.operator.name}`,
      );
    }

    const { currentTotal, expectedTotal } = settlementData;

    settlementData.initValue = initValue;
    settlementData.currentTotal = setDecimalPlaces(currentTotal + initValue, 2);
    settlementData.expectedTotal = setDecimalPlaces(
      expectedTotal + initValue,
      2,
    );

    if (description !== undefined) {
      settlementData.description = description;
    }

    const created = await this.save({ ...settlementData, placeCode });

    return this.findOneByOrFail({ id: created.id });
  }

  async update(id: string, toDate: string, description?: string) {
    const settlement = await this.findOneByOrFail({ id });

    if (settlement.isClosed) {
      throw new UnauthorizedException('Caixa fechado. Não é possível alterar');
    }

    const { workDay: initDate, operator } = settlement;
    const { endDate: to } = await this.workTimeDateService.create(
      { id: operator.id },
      new Date(0).toISOString(),
      toDate,
    );

    if (getUnixTime(initDate) > getUnixTime(to)) {
      throw new BadRequestException(
        'A data final não pode ser maior do que a data inicial',
      );
    }

    const newSettlement = await this.preview({ id: operator.id }, initDate, to);
    const mergedSettlement = {
      ...settlement,
      ...newSettlement,
      description: description ?? settlement.description,
    };
    const updated = await this.save(mergedSettlement);

    return this.findOneByOrFail({ id: updated.id });
  }

  async updateIsClosed(id: string, flag: boolean) {
    const settlement = await this.findOneByOrFail({ id });

    settlement.isClosed = flag;

    const updated = await this.save(settlement);

    return this.findOneByOrFail({ id: updated.id });
  }

  async updatePlaceCode(id: string, placeCode: string) {
    const settlement = await this.findOneByOrFail({ id });
    if (settlement.isClosed) {
      throw new UnauthorizedException(
        'Não é possível atualizar um caixa fechado',
      );
    }
    settlement.placeCode = placeCode ?? settlement.placeCode;
    const updated = await this.save(settlement);
    return this.findOneByOrFail({ id: updated.id });
  }

  async findOneByOrFail(settlementData: FindOptionsWhere<Settlement>) {
    const settlement = await this.findOneBy(settlementData);

    if (!settlement) {
      throw new NotFoundException('Caixa não encontrado');
    }

    return settlement;
  }

  findOneBy(settlementData: FindOptionsWhere<Settlement>) {
    return this.settlementRepository.findOne({
      where: settlementData,
      relations: {
        operator: { workTime: true },
        vouchers: voucherRelations,
      },
    });
  }

  findOneByWorkDayAndOperator({
    workDay,
    operator,
  }: FindOptionsWhere<Settlement>) {
    return this.settlementRepository.findOne({
      where: {
        workDay,
        operator,
      },
      relations: { operator: true },
    });
  }

  findAllOwned(
    user: User,
    orderParams?: {
      [K in keyof FindOptionsOrder<Settlement>]: FindOptionsOrderValue;
    },
  ) {
    return this.settlementRepository.find({
      where: {
        operator: { id: user.id },
      },
      order: orderParams,
      relations: { operator: true },
    });
  }

  findAll(
    queryParams: FindOptionsWhere<Settlement>,
    orderParams?: {
      [K in keyof FindOptionsOrder<Settlement>]: FindOptionsOrderValue;
    },
  ) {
    return this.settlementRepository.find({
      where: queryParams,
      order: orderParams,
      relations: { operator: true },
    });
  }

  async remove(id: string) {
    const settlement = await this.findOneByOrFail({ id });

    if (settlement.isClosed) {
      throw new UnauthorizedException('Caixa fechado.\nNão é possível apagar');
    }

    await this.settlementRepository.delete({ id });
    return settlement;
  }

  async save(settlement: Partial<Settlement>) {
    return this.settlementRepository.save(settlement);
  }
}
