import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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

    const payout = {
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

  create() {}

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
