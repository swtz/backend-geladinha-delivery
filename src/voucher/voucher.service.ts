import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(VoucherEntity)
    private readonly voucherRepository: Repository<VoucherEntity>,
  ) {}
}
