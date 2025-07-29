import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryEntity } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}
}
