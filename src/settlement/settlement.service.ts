import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Settlement } from './entities/settlement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';
import { UserService } from 'src/user/user.service';
import { VoucherService } from 'src/voucher/voucher.service';
import { User } from 'src/user/entities/user.entity';
import { parseBrDate } from 'src/common/parse-br-date';
import {
  CURRENT_SHORT_DATE,
  END_TIME,
  IS_ANOTHER_DAY,
  START_TIME,
} from 'src/common/operation-time';
import { weekDays } from 'src/common/enums/weekDays.enum';
import { setDecimalPlaces } from 'src/common/set-decimal-places';
import { generateRelativeDate } from 'src/common/generate-date';
import { PaymentMethod } from 'src/delivery/enums/payment-methods.enum';

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
    if (!userData.name) {
      throw new BadRequestException('Informe o nome do operador de caixa');
    }

    const dateObject = {
      initDate: fromDate || parseBrDate(CURRENT_SHORT_DATE, START_TIME),
      endDate: toDate || parseBrDate(CURRENT_SHORT_DATE, END_TIME),
    };

    if (IS_ANOTHER_DAY) {
      dateObject.endDate = generateRelativeDate(
        'tomorrow',
        dateObject.initDate,
        END_TIME,
      );
    }

    const operator = await this.userService.findOneByOrFail(userData);
    const vouchers = await this.voucherService.findAllOwned({
      user: operator,
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
    });
    const deliveries = await this.deliveryService.findAll({
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
      operatorName: userData.name,
    });

    const settlement = {
      weekDay: weekDays[dateObject.initDate.getDay()],
      workDay: dateObject.initDate,
      amountDeliveries: deliveries.length,
      totalRemainingMotoboy: 0,
      subtotal: 0,
      moneySubtotal: 0,
      cardSubtotal: 0,
      pixSubtotal: 0,
      totalSpending: 0,
      currentTotal: 0,
      expectedTotal: 0,
      operator,
      vouchers,
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

        if (name === PaymentMethod.Credit || name === PaymentMethod.Debit) {
          sumPaymentMethodSubtotal('card', delivery.totalPurchase);
        } else {
          sumPaymentMethodSubtotal(name, delivery.totalPurchase);
        }
      });
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;
      const { name } = delivery.paymentMethod;

      sumPaymentMethodSubtotal(name, delivery.totalPurchase);
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

    // Criar um campo indicando a quantia correta que o caixa deve fechar,
    // para evitar que o usuário tenha que recalcular os valores, a fim
    // de averiguar alguma inconsistência. Ex.: currentValue
    settlement.currentTotal = setDecimalPlaces(
      settlement.subtotal -
        settlement.totalSpending -
        settlement.totalRemainingMotoboy,
      2,
    );

    settlement.expectedTotal = setDecimalPlaces(
      settlement.subtotal - settlement.totalSpending,
      2,
    );

    return settlement;
  }

  async create(
    settlementData: Partial<Omit<Settlement, 'workDay' | 'operator'>> & {
      workDay: Date;
      operator: User;
    },
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

    return this.save(settlementData);
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

  async save(settlement: Partial<Settlement>) {
    const created = await this.settlementRepository
      .save(settlement)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao salvar caixa do televendas', err.stack);
        }

        throw new BadRequestException('Erro ao salvar caixa do televendas');
      });

    return created;
  }
}
