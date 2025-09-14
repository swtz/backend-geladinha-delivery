import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly deliveryService: DeliveryService,
  ) {}

  async preview(fromDate: Date, toDate: Date, motoboy: string) {
    const deliveries = await this.deliveryService.findAll({
      fromDate,
      toDate,
      motoboy,
    });

    return deliveries;
  }
}
