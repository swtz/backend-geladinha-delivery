import { BadRequestException, Injectable } from '@nestjs/common';
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
  START_TIME,
} from 'src/common/operation-time';
import { weekDays } from 'src/common/enums/weekDays.enum';
import { setDecimalPlaces } from 'src/common/set-decimal-places';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly deliveryService: DeliveryService,
    private readonly voucherService: VoucherService,
    private readonly userService: UserService,
  ) {}

  async preview(userData: Partial<User>, fromDate?: Date, toDate?: Date) {
    if (!userData) {
      throw new BadRequestException('Informe o nome do operador de caixa');
    }

    const currentFromDate = parseBrDate(CURRENT_SHORT_DATE, START_TIME);
    const currentToDate = parseBrDate(CURRENT_SHORT_DATE, END_TIME);

    const initDate = fromDate || currentFromDate;
    const endDate = toDate || currentToDate;

    const operator = await this.userService.findOneByOrFail(userData);
    const vouchers = await this.voucherService.findAllOwned({
      user: operator,
      fromDate: initDate,
      toDate: endDate,
    });
    const deliveries = await this.deliveryService.findAll({
      fromDate: initDate,
      toDate: endDate,
      operatorName: userData.name,
    });

    const paymentMethodDict = {
      money: 0,
      debit: 0,
      credit: 0,
      pix: 0,
    };
    const settlement = {
      weekDay: weekDays[initDate.getDay()],
      workDay: initDate,
      amountDeliveries: 0,
      totalRemainingMotoboy: 0,
      subtotal: 0,
      moneySubtotal: 0,
      cardSubtotal: 0,
      pixSubtotal: 0,
      totalSpending: 0,
      total: 0,
      operator,
      vouchers,
    };

    if (deliveries.length > 1) {
      settlement.subtotal = await this.deliveryService.sumTotalPurchaseCol({
        user: operator,
        fromDate: initDate,
        toDate: endDate,
      });

      deliveries.forEach(delivery => {
        const { name } = delivery.paymentMethod;
        paymentMethodDict[name] += delivery.totalPurchase;
      });
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;
      const { name } = delivery.paymentMethod;

      paymentMethodDict[name] = delivery.totalPurchase;
      settlement.subtotal = delivery.totalPurchase;
    }

    settlement.amountDeliveries = deliveries.length;

    settlement.moneySubtotal = paymentMethodDict.money;
    settlement.cardSubtotal =
      paymentMethodDict.debit + paymentMethodDict.credit;
    settlement.pixSubtotal = paymentMethodDict.pix;

    settlement.totalSpending = await this.voucherService.sum({
      user: operator,
      fromDate: initDate,
      toDate: endDate,
    });

    settlement.totalRemainingMotoboy =
      await this.deliveryService.sumTotalPurchaseCol({
        user: operator,
        fromDate: initDate,
        toDate: endDate,
        isPaid: false,
      });

    // Criar um campo indicando a quantia correta que o caixa deve fechar,
    // para evitar que o usuário tenha que recalcular os valores, a fim
    // de averiguar alguma inconsistência. Ex.: currentValue
    settlement.total =
      setDecimalPlaces(settlement.subtotal - settlement.totalSpending, 2) -
      settlement.totalRemainingMotoboy;

    return settlement;
  }
}
