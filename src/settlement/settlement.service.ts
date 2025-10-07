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

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly deliveryService: DeliveryService,
    private readonly voucherService: VoucherService,
    private readonly userService: UserService,
  ) {}

  async preview(fromDate: Date, toDate: Date, userData: Partial<User>) {
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
  }
}
