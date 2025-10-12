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
import { parseBrDate } from 'src/common/parse-br-date';
import { UserService } from 'src/user/user.service';
import { setDecimalPlaces } from 'src/common/set-decimal-places';
import { VoucherService } from 'src/voucher/voucher.service';
import { DeliveryMan } from 'src/user/entities/user.entity';
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { generateRelativeDate } from 'src/common/generate-date';

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

  async preview(fromDate: Date, toDate: Date, motoboyData: string) {
    if (!motoboyData) {
      throw new BadRequestException('Informe o nome do motoboy');
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

    // e se motoboy foi excluído e operator quer consultar o payout?
    // no momento → Payout.motoboy = onDelete: 'CASCADE'
    const motoboy = await this.userService.findOneMotoboyByOrFail({
      name: motoboyData,
    });
    const vouchers = await this.voucherService.findAllOwned({
      user: motoboy,
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
    });

    const deliveries = await this.deliveryService.findAll({
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
      motoboyName: motoboy.name,
    });

    const payout = {
      weekDay: weekDays[dateObject.initDate.getDay()],
      workDay: dateObject.initDate,
      totalDeliveries: 0,
      motoboyDaily: 0,
      motoboyTips:
        deliveries.reduce((prev, delivery) => {
          if (delivery.tip !== null) {
            return (prev += delivery.tip.amount);
          }
        }, 0) ?? 0,
      subtotal: 0,
      totalSpending: 0,
      total: 0,
      motoboy,
      vouchers,
    };

    if (deliveries.length > 1) {
      payout.totalDeliveries = await this.deliveryService.sumDeliveryTaxCol({
        user: motoboy,
        fromDate: dateObject.initDate,
        toDate: dateObject.endDate,
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
      fromDate: dateObject.initDate,
      toDate: dateObject.endDate,
    });

    payout.total = setDecimalPlaces(payout.subtotal - payout.totalSpending, 2);

    const yesterday = generateRelativeDate(
      'yesterday',
      dateObject.initDate,
      START_TIME,
    );
    const yesterdayPayout = await this.findOneByWorkDayAndMotoboy(yesterday, {
      id: motoboy.id,
    });

    if (yesterdayPayout && yesterdayPayout.total < 0) {
      payout.total = setDecimalPlaces(payout.total + yesterdayPayout.total, 2);
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

    const newPayout = await this.preview(
      initDate,
      dateObject.endDate,
      motoboy.name,
    );
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

  findAllOwned(user: DeliveryMan) {
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
    motoboy?: { name: string };
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
    const created = await this.payoutRepository
      .save(payout)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao salvar pagamento do motoboy', err.stack);
        }

        throw new BadRequestException('Erro ao salvar pagamento do motoboy');
      });

    return created;
  }
}
