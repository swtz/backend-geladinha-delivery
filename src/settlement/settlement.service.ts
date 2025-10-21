import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Settlement } from './entities/settlement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';
import { UserService } from 'src/user/user.service';
import { VoucherService } from 'src/voucher/voucher.service';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import {
  CURRENT_SHORT_DATE,
  END_TIME,
  IS_ANOTHER_DAY,
  START_TIME,
} from 'src/common/operation-time';
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { PaymentMethod } from 'src/delivery/enums/payment-methods.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly deliveryService: DeliveryService,
    private readonly voucherService: VoucherService,
    private readonly userService: UserService,
  ) {}

  async preview(userData: Partial<User>, fromDate?: Date, toDate?: Date) {
    const operator = await this.userService.findOneByOrFail(userData);

    if (operator instanceof DeliveryMan) {
      throw new BadRequestException('Motoboys não possuem caixa para fechar');
    }

    if (!userData.name) {
      throw new BadRequestException('Informe o nome do operador de caixa');
    }

    const dateObject = {
      initDate: fromDate || parseBrDate(CURRENT_SHORT_DATE, START_TIME),
      endDate: toDate || parseBrDate(CURRENT_SHORT_DATE, END_TIME),
    };

    const exists = await this.findOneByWorkDayAndOperator(dateObject.initDate, {
      id: operator.id,
    });

    if (IS_ANOTHER_DAY) {
      dateObject.endDate = generateRelativeDate(
        'tomorrow',
        dateObject.initDate,
        END_TIME,
      );
    }

    const vouchers = await this.voucherService.findAllOwned({
      user: operator,
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
    });
    const deliveries = await this.deliveryService.findAll({
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
      optName: userData.name,
    });

    const settlement = {
      weekDay: weekDays[dateObject.initDate.getDay()],
      workDay: dateObject.initDate,
      initValue: exists !== null ? exists.initValue : undefined,
      amountDeliveries: deliveries.length,
      totalRemainingMotoboy: 0,
      subtotal: 0,
      moneySubtotal: 0,
      cardSubtotal: 0,
      pixSubtotal: 0,
      totalSpending: 0,
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
        user: operator,
        fromDate: dateObject.initDate,
        toDate: dateObject.endDate,
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

    settlement.totalSpending = await this.voucherService.sum({
      user: operator,
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
    });

    settlement.totalRemainingMotoboy =
      await this.deliveryService.sumTotalPurchaseCol({
        user: operator,
        fromDate: dateObject.initDate,
        toDate: dateObject.endDate,
        isPaid: false,
      });

    const currentTotal = setDecimalPlaces(
      settlement.subtotal -
        settlement.totalSpending -
        settlement.totalRemainingMotoboy,
      2,
    );
    const expectedTotal = currentTotal + settlement.totalRemainingMotoboy;

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
    settlementData: Partial<
      Omit<
        Settlement,
        'workDay' | 'operator' | 'currentTotal' | 'expectedTotal'
      >
    > & {
      workDay: Date;
      operator: User;
      expectedTotal: number;
      currentTotal: number;
    },
    initValue: number,
    description?: string,
  ) {
    const exists = await this.findOneByWorkDayAndOperator(
      settlementData.workDay,
      { id: settlementData.operator.id },
    );

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

    return this.save(settlementData);
  }

  async update(id: string, description?: string) {
    const settlement = await this.findOneByOrFail({ id });

    if (settlement.isClosed) {
      throw new UnauthorizedException('Caixa fechado. Não é possível alterar');
    }

    const { workDay: initDate, operator } = settlement;
    const dateObject = {
      endDate: new Date(
        initDate.getFullYear(),
        initDate.getMonth(),
        initDate.getDate(),
        END_TIME,
      ),
    };

    if (IS_ANOTHER_DAY) {
      dateObject.endDate = generateRelativeDate('tomorrow', initDate, END_TIME);
    }

    const newSettlement = await this.preview(
      { name: operator.name },
      initDate,
      dateObject.endDate,
    );
    const mergedSettlement = {
      ...settlement,
      ...newSettlement,
      description: description ?? settlement.description,
    };

    return this.save(mergedSettlement);
  }

  async updateIsClosed(id: string, flag: boolean) {
    const settlement = await this.findOneByOrFail({ id });
    settlement.isClosed = flag;
    return this.save(settlement);
  }

  async findOneByOrFail(settlementData: Partial<Settlement>) {
    const settlement = await this.findOneBy(settlementData);

    if (!settlement) {
      throw new NotFoundException('Caixa não encontrado');
    }

    return settlement;
  }

  findOneBy(settlementData: Partial<Settlement>) {
    return this.settlementRepository.findOne({
      where: settlementData,
      relations: {
        operator: true,
        vouchers: voucherRelations,
      },
    });
  }

  findOneByWorkDayAndOperator(workDay: Date, operatorData: Partial<User>) {
    return this.settlementRepository.findOne({
      where: {
        workDay,
        operator: operatorData,
      },
      relations: {
        operator: true,
        vouchers: true,
      },
    });
  }

  findAllOwned(user: User) {
    return this.settlementRepository.find({
      where: {
        operator: { id: user.id },
      },
      order: { workDay: 'DESC' },
      relations: {
        operator: true,
        vouchers: voucherRelations,
      },
    });
  }

  findAll(queryParams: {
    weekDay?: WeekDay;
    workDay?: Date;
    operator?: { name: string };
    isClosed?: boolean;
  }) {
    return this.settlementRepository.find({
      where: queryParams,
      order: { workDay: 'DESC' },
      relations: { operator: true, vouchers: voucherRelations },
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
    const http400 = generateBadRequestException(
      'Erro ao salvar caixa do televendas',
    );
    const created = await this.settlementRepository
      .save(settlement)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
