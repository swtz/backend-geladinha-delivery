import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryMan } from '../entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeliveryManService {
  constructor(
    @InjectRepository(DeliveryMan)
    private readonly deliveryManRepository: Repository<DeliveryMan>,
  ) {}
}
