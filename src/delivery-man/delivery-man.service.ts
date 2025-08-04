import { Injectable } from '@nestjs/common';
import { VoucherService } from 'src/voucher/voucher.service';
import { Repository } from 'typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeliveryManService {
  constructor(
    @InjectRepository(DeliveryManEntity)
    private readonly deliveryManRepository: Repository<DeliveryManEntity>,
    private readonly voucherService: VoucherService,
  ) {}
}
