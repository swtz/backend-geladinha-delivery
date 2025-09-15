import { BadRequestException, Injectable } from '@nestjs/common';
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
      subtotal: 0,
      totalSpending: 0,
      total: 0,
      isClosed: false,
      motoboy,
      vouchers,
    };

    if (deliveries.length > 1) {
      // uso dos recursos SQL de soma
      // gerar → totalDeliveries + tips
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;
      payout.totalDeliveries = delivery.deliveryTax;

      if (motoboy.tip !== null) {
        payout.totalDeliveries += motoboy.tip;
      }
    }

    payout.motoboyDaily = motoboy.daily;
    payout.subtotal = setDecimalPlaces(
      payout.motoboyDaily + payout.totalDeliveries,
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
}
