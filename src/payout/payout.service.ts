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
  START_TIME,
} from 'src/common/operation-time';
import { parseBrDate } from 'src/common/parse-br-date';
import { UserService } from 'src/user/user.service';
import { setDecimalPlaces } from 'src/common/set-decimal-places';
import { VoucherService } from 'src/voucher/voucher.service';
import { DeliveryMan } from 'src/user/entities/user.entity';
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { generateYesterdayDate } from 'src/common/generate-yesterday-date';

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

    const currentFromDate = parseBrDate(CURRENT_SHORT_DATE, START_TIME);
    const currentToDate = parseBrDate(CURRENT_SHORT_DATE, END_TIME);

    const initDate = fromDate || currentFromDate;
    const endDate = toDate || currentToDate;

    // e se motoboy foi excluído e operator quer consultar o payout?
    // no momento → Payout.motoboy = onDelete: 'CASCADE'
    const motoboy = await this.userService.findOneMotoboyByOrFail({
      name: motoboyData,
    });
    const vouchers = await this.voucherService.findAllOwned({
      user: motoboy,
      fromDate: initDate,
      toDate: endDate,
    });

    // vou precisar criar um método com operadores AND do SQL
    // para garantir que a consulta leve em conta todos os parâmetros fornecidos
    // fazer testes para garantir a necessidade de criar esse outro método
    const deliveries = await this.deliveryService.findAll({
      fromDate: initDate,
      toDate: endDate,
      motoboyName: motoboy.name,
    });

    const payout = {
      weekDay: weekDays[initDate.getDay()],
      workDay: initDate,
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
        fromDate: initDate,
        toDate: endDate,
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
      fromDate: initDate,
      toDate: endDate,
    });

    payout.total = setDecimalPlaces(payout.subtotal - payout.totalSpending, 2);

    const yesterday = generateYesterdayDate(fromDate).toLocaleString('pt-BR', {
      dateStyle: 'short',
    });
    const parsedYesterday = parseBrDate(yesterday, START_TIME);
    const yesterdayPayout = await this.findOneByWorkDayAndMotoboy(
      parsedYesterday,
      {
        id: motoboy.id,
      },
    );

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
        `Já existe uma entrega lançada para esse dia.\nMotoboy: ${motoboyName}`,
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

    const shortInitDate = initDate.toLocaleString('BR', {
      dateStyle: 'short',
    });
    const endDate = parseBrDate(shortInitDate, END_TIME);

    const newPayout = await this.preview(initDate, endDate, motoboy.name);
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

  findAll(queryParams: {
    weekDay?: WeekDay;
    workDay?: Date;
    motoboy?: { name: string };
    isClosed?: boolean;
  }) {
    return this.payoutRepository.find({
      where: queryParams,
      order: { createdAt: 'DESC' },
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
