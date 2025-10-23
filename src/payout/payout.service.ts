import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';
import {
  CURRENT_SHORT_DATE,
  END_TIME,
  IS_ANOTHER_DAY,
  START_TIME,
} from 'src/common/operation-time';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import { UserService } from 'src/user/user.service';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { VoucherService } from 'src/voucher/voucher.service';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly deliveryService: DeliveryService,
    private readonly userService: UserService,
    private readonly voucherService: VoucherService,
  ) {}

  async preview(from: Date, to: Date, motoboyData: Partial<DeliveryMan>) {
    if (Object.keys(motoboyData).length === 0) {
      throw new BadRequestException('Informe os dados para consulta');
    }

    const motoboy = await this.userService.findOneMotoboyByOrFail(motoboyData);

    const dateObject = {
      initDate: from || parseBrDate(CURRENT_SHORT_DATE, START_TIME),
      endDate: to || parseBrDate(CURRENT_SHORT_DATE, END_TIME),
    };

    if (END_TIME < START_TIME) {
      dateObject.endDate = generateRelativeDate(
        'tomorrow',
        dateObject.initDate,
        END_TIME,
      );
    }

    if (motoboy.workTime) {
      const { initHour, endHour } = motoboy.workTime;
      const initShortDate = dateObject.initDate.toLocaleString('BR', {
        dateStyle: 'short',
      });

      dateObject.initDate = parseBrDate(initShortDate, initHour);

      if (endHour < initHour) {
        dateObject.endDate = generateRelativeDate(
          'tomorrow',
          dateObject.initDate,
          endHour,
        );
      }
    }

    const vouchers = await this.voucherService.findAllOwned({
      user: motoboy,
      from: dateObject.initDate,
      to: dateObject.endDate,
    });

    const deliveries = await this.deliveryService.findAll({
      from: dateObject.initDate,
      to: dateObject.endDate,
      userData: motoboyData,
    });

    const motoboyTips = deliveries.reduce((prev, item) => {
      if (item.tip !== null) {
        return (prev += item.tip.amount);
      }
      return prev;
    }, 0);

    const payout = {
      weekDay: weekDays[dateObject.initDate.getDay()],
      workDay: dateObject.initDate,
      totalDeliveries: 0,
      motoboyDaily: 0,
      motoboyTips,
      subtotal: 0,
      totalSpending: 0,
      total: 0,
      motoboy,
      vouchers,
    };

    if (deliveries.length > 1) {
      payout.totalDeliveries = await this.deliveryService.sumDeliveryTaxCol({
        user: motoboy,
        from: dateObject.initDate,
        to: dateObject.endDate,
      });
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;

      payout.totalDeliveries = delivery.deliveryTax;
    }

    payout.motoboyDaily = motoboy.daily;
    payout.subtotal = setDecimalPlaces(
      payout.motoboyDaily + payout.totalDeliveries + payout.motoboyTips,
      2,
    );

    payout.totalSpending = await this.voucherService.sum({
      user: motoboy,
      from: dateObject.initDate,
      to: dateObject.endDate,
    });

    payout.total = setDecimalPlaces(payout.subtotal - payout.totalSpending, 2);

    const lastPayouts = await this.findAll({
      isClosed: true,
      motoboy: { id: motoboy.id },
    });

    if (lastPayouts.length === 0) {
      return payout;
    }

    const lastPayout = lastPayouts[0];

    if (lastPayout && lastPayout.total < 0) {
      payout.total = setDecimalPlaces(payout.total + lastPayout.total, 2);
    }

    return payout;
  }

  async create(
    payoutData: Partial<Omit<Payout, 'workDay' | 'motoboy'>> & {
      workDay: Date;
      motoboy: DeliveryMan;
    },
  ) {
    const exists = await this.findOneByWorkDayAndMotoboy(payoutData.workDay, {
      id: payoutData.motoboy.id,
    });

    if (exists) {
      const motoboyName = exists.motoboy.name;

      throw new ConflictException(
        `Já existe um pagamento lançado para esse dia.\nMotoboy: ${motoboyName}`,
      );
    }

    return this.save(payoutData);
  }

  async update(id: string) {
    const payout = await this.findOneByOrFail({ id });

    if (payout.isClosed) {
      throw new UnauthorizedException(
        'Não é possível alterar um pagamento fechado',
      );
    }

    const { workDay: initDate, motoboy } = payout;
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

    const newPayout = await this.preview(initDate, dateObject.endDate, {
      id: motoboy.id,
    });
    const mergedPayout = {
      ...payout,
      ...newPayout,
    };

    return this.save(mergedPayout);
  }

  async updateIsClosed(id: string, flag: boolean) {
    const payout = await this.findOneByOrFail({ id });
    payout.isClosed = flag;
    return this.save(payout);
  }

  async findOneByOrFail(payoutData: Partial<Payout>) {
    const payout = await this.findOneBy(payoutData);

    if (!payout) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payout;
  }

  findOneBy(payoutData: Partial<Payout>) {
    return this.payoutRepository.findOne({
      where: payoutData,
      relations: {
        motoboy: true,
        vouchers: voucherRelations,
      },
    });
  }

  findOneByWorkDayAndMotoboy(workDay: Date, motoboyData: Partial<DeliveryMan>) {
    return this.payoutRepository.findOne({
      where: {
        workDay,
        motoboy: motoboyData,
      },
      relations: {
        motoboy: true,
        vouchers: true,
      },
    });
  }

  findAllOwned(user: User) {
    return this.payoutRepository.find({
      where: {
        motoboy: { id: user.id },
      },
      order: { workDay: 'DESC' },
      relations: {
        motoboy: true,
        vouchers: voucherRelations,
      },
    });
  }

  findAll(queryParams: {
    weekDay?: WeekDay;
    workDay?: Date;
    motoboy?: Partial<DeliveryMan>;
    isClosed?: boolean;
  }) {
    return this.payoutRepository.find({
      where: queryParams,
      order: { workDay: 'DESC' },
      relations: { motoboy: true, vouchers: voucherRelations },
    });
  }

  async remove(id: string) {
    const payout = await this.findOneByOrFail({ id });

    if (payout.isClosed) {
      throw new UnauthorizedException(
        'Não é possível remover um pagamento fechado',
      );
    }

    await this.payoutRepository.delete({ id });
    return payout;
  }

  async save(payout: Partial<Payout>) {
    const http400 = generateBadRequestException(
      'Erro ao salvar pagamento do motoboy',
    );
    const created = await this.payoutRepository
      .save(payout)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
