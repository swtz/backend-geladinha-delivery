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

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly deliveryService: DeliveryService,
    private readonly userService: UserService,
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

    // vou precisar criar um método com operadores AND do SQL
    // para garantir que a consulta leve em conta todos os parâmetros fornecidos
    // fazer testes para garantir a necessidade de criar esse outro método
    const deliveries = await this.deliveryService.findAll({
      fromDate: fromDate !== undefined ? fromDate : currentFromDate,
      toDate: toDate !== undefined ? toDate : currentToDate,
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
      // criar método para filtrar voucher com base no mesmo período das entregas
      vouchers: motoboy.vouchers,
    };

    if (deliveries.length > 1) {
      // uso dos recursos SQL de soma
      // gerar → totalDeliveries + tips
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;

      // delivery.deliveryTax + tip
      payout.totalDeliveries = delivery.deliveryTax;

      // gerar → totalDeliveries
      if (motoboy.tip !== null) {
        payout.totalDeliveries += motoboy.tip;
      }
    }

    // daily + totalDeliveries = subtotal
    payout.motoboyDaily = motoboy.daily;
    payout.subtotal = payout.motoboyDaily + payout.totalDeliveries;

    // gerar totalSpending (vouchers.amount)
    motoboy.vouchers.forEach(voucher => {
      payout.totalSpending += voucher.amount;
    });
    const totalSpending = +payout.totalSpending.toFixed(2);
    payout.totalSpending = totalSpending;

    // subTotal - totalSpending
    // total (suporta valores negativos)
    const tempTotal = payout.subtotal - totalSpending;
    payout.total = +tempTotal.toFixed(2);

    return payout;
  }
}
