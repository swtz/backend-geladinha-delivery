import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly deliveryService: DeliveryService,
  ) {}

  async preview(fromDate: Date, toDate: Date, motoboy: string) {
    const currentFromDate = parseBrDate(CURRENT_SHORT_DATE, START_TIME);
    const currentToDate = parseBrDate(CURRENT_SHORT_DATE, END_TIME);

    const deliveries = await this.deliveryService.findAll({
      fromDate: fromDate !== undefined ? fromDate : currentFromDate,
      toDate: toDate !== undefined ? toDate : currentToDate,
      motoboy,
    });

    return deliveries;
  }
}
