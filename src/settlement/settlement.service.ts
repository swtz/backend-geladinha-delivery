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
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { PaymentMethod } from 'src/delivery/enums/payment-methods.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { generateBadRequestException } from 'src/common/generate-exception';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { PlaceService } from 'src/place/place.service';
import { Role } from 'src/common/role/roles.enum';
import { Voucher } from 'src/voucher/enums/voucher.enum';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly deliveryService: DeliveryService,
    private readonly voucherService: VoucherService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
    private readonly placeService: PlaceService,
  ) {}

  async preview(userData: Partial<User>, from?: Date, to?: Date) {
    // userData.name = userData.name ?? '';
    const operator = await this.userService.findOneByOrFail(userData);

    if (operator instanceof DeliveryMan) {
      throw new BadRequestException('Motoboys não possuem caixa para fechar');
    }

    if (Object.keys(userData).length === 0) {
      throw new BadRequestException('Informe os dados para consulta');
    }

    const place = await this.placeService.findOneBy({
      code: process.env.DEFAULT_PLACE_CODE,
    });

    if (!place) {
      throw new NotFoundException(
        'Nenhum estabelecimento definido como padrão',
      );
    }

    const workTime = this.workTimeService.findDefaultFromPlaceOrFail(place);
    const { initHour, endHour } = operator.workTime
      ? operator.workTime
      : workTime;

    const dateObject = {
      initDate: from || parseBrDate(new Date(), initHour),
      endDate: to || parseBrDate(new Date(), endHour),
    };

    if (operator.workTime) {
      dateObject.initDate = parseBrDate(dateObject.initDate, initHour);
      dateObject.endDate = parseBrDate(dateObject.endDate, endHour);
    }

    if (endHour < initHour) {
      dateObject.endDate = generateRelativeDate(
        'tomorrow',
        dateObject.initDate,
        endHour,
      );
    }

    const exists = await this.findOneByWorkDayAndOperator(dateObject.initDate, {
      id: operator.id,
    });

    const vouchers = await this.voucherService.findAll({
      from: dateObject.initDate,
      to: dateObject.endDate,
      type: Voucher.User,
      userData,
    });
    const deliveries = await this.deliveryService.findAll({
      from: dateObject.initDate,
      to: dateObject.endDate,
      type: Role.Operator,
      userData,
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
        userData,
        from: dateObject.initDate,
        to: dateObject.endDate,
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
      from: dateObject.initDate,
      to: dateObject.endDate,
      type: Voucher.User,
      userData,
    });

    settlement.totalRemainingMotoboy =
      await this.deliveryService.sumTotalPurchaseCol({
        userData,
        from: dateObject.initDate,
        to: dateObject.endDate,
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

    const place = await this.placeService.findOneBy({
      code: process.env.DEFAULT_PLACE_CODE,
    });

    if (!place) {
      throw new NotFoundException(
        'Nenhum estabelecimento definido como padrão',
      );
    }

    const { workDay: initDate, operator } = settlement;
    const workTime = this.workTimeService.findDefaultFromPlaceOrFail(place);
    const { initHour, endHour } = operator.workTime
      ? operator.workTime
      : workTime;

    let endDate = parseBrDate(initDate, endHour);

    if (endHour < initHour) {
      endDate = generateRelativeDate('tomorrow', initDate, endHour);
    }

    const newSettlement = await this.preview(
      { id: operator.id },
      initDate,
      endDate,
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
        operator: { workTime: true },
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
      relations: { operator: true },
    });
  }

  findAllOwned(user: User) {
    return this.settlementRepository.find({
      where: {
        operator: { id: user.id },
      },
      order: { workDay: 'DESC' },
      relations: { operator: true },
    });
  }

  findAll(queryParams: {
    weekDay?: WeekDay;
    workDay?: Date;
    operator?: Partial<User>;
    isClosed?: boolean;
  }) {
    return this.settlementRepository.find({
      where: queryParams,
      order: { workDay: 'DESC' },
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
