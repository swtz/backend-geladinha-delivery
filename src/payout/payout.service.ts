import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
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

    // e se motoboy foi excluído e operator quer consultar o payout?
    // no momento → Payout.motoboy = onDelete: 'CASCADE'
    const motoboy = await this.userService.findOneMotoboyByOrFail({
      name: motoboyData,
    });
    const vouchers = await this.voucherService.findAllOwned(
      motoboy,
      fromDate || currentFromDate,
      toDate || currentToDate,
    );

    // vou precisar criar um método com operadores AND do SQL
    // para garantir que a consulta leve em conta todos os parâmetros fornecidos
    // fazer testes para garantir a necessidade de criar esse outro método
    const deliveries = await this.deliveryService.findAll({
      fromDate: fromDate || currentFromDate,
      toDate: toDate || currentToDate,
      motoboy: motoboy.name,
    });

    const weekDays = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];

    const payout = {
      weekDay: '',
      workDay: fromDate || currentFromDate,
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
      isClosed: false,
      motoboy,
      vouchers,
    };

    if (fromDate === undefined) {
      payout.weekDay = weekDays[currentFromDate.getDay()];
    } else {
      payout.weekDay = weekDays[fromDate.getDay()];
    }

    if (deliveries.length > 1) {
      payout.totalDeliveries = await this.deliveryService.sumDeliveryTaxCol(
        motoboy,
        fromDate || currentFromDate,
        toDate || currentToDate,
      );
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;

      payout.totalDeliveries = delivery.deliveryTax;
    }

    payout.motoboyDaily = motoboy.daily;
    payout.subtotal = setDecimalPlaces(
      payout.motoboyDaily + payout.totalDeliveries + payout.motoboyTips,
      2,
    );

    payout.totalSpending = await this.voucherService.sum(
      motoboy,
      fromDate || currentFromDate,
      toDate || currentToDate,
    );

    payout.total = setDecimalPlaces(payout.subtotal - payout.totalSpending, 2);

    return payout;
  }

  async create(
    payoutData: Partial<Omit<Payout, 'workDay'>> & { workDay: Date },
  ) {
    const exists = await this.findOneByWorkDayAndMotoboy(payoutData.workDay, {
      id: payoutData.motoboy?.id,
    });

    if (exists) {
      const motoboyName = exists.motoboy.name;

      throw new ConflictException(
        `Já existe uma entrega lançada para esse dia.\nMotoboy: ${motoboyName}`,
      );
    }

    return this.save(payoutData);
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
      relations: ['motoboy', 'vouchers'],
    });
  }

  findOneByWorkDayAndMotoboy(workDay: Date, motoboyData: Partial<DeliveryMan>) {
    return this.payoutRepository.findOne({
      where: {
        workDay,
        motoboy: motoboyData,
      },
      relations: ['motoboy', 'vouchers'],
    });
  }
}
