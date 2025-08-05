import { ConflictException, Injectable } from '@nestjs/common';
import { VoucherService } from 'src/voucher/voucher.service';
import { Repository } from 'typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';

@Injectable()
export class DeliveryManService {
  constructor(
    @InjectRepository(DeliveryManEntity)
    private readonly deliveryManRepository: Repository<DeliveryManEntity>,
    private readonly voucherService: VoucherService,
  ) {}

  async create(dto: CreateDeliveryManDto) {
    await this.failIfEmailExists(dto.email);
  }

  async failIfEmailExists(email: string) {
    const exists = await this.findByEmail(email);

    if (!exists) {
      throw new ConflictException('Email já existe');
    }
  }

  findByEmail(email: string) {
    return this.deliveryManRepository.findOneBy({ email });
  }
}
