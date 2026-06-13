import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethod as PaymentMethodEnum } from '../enums/payment-methods.enum';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findOneOrCreate(name: PaymentMethodEnum, manager?: EntityManager) {
    const paymentMethod = await this.findOneBy({ name }, manager);

    if (!paymentMethod) {
      const created = await this.save({ name }, manager);
      return this.findOneByOrFail({ id: created.id }, manager);
    }

    return paymentMethod;
  }

  findOneBy(
    paymentMethodData: Partial<PaymentMethod>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(PaymentMethod)
      : this.paymentMethodRepository;
    return repo.findOne({
      where: paymentMethodData,
      relations: { deliveries: true },
    });
  }

  async findOneByOrFail(
    paymentMethodData: Partial<PaymentMethod>,
    manager?: EntityManager,
  ) {
    const paymentMethod = await this.findOneBy(paymentMethodData, manager);

    if (!paymentMethod) {
      throw new NotFoundException('Método de pagamento não existe');
    }

    return paymentMethod;
  }

  async save(
    paymentMethodData: Partial<PaymentMethod>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(PaymentMethod)
      : this.paymentMethodRepository;
    return repo.save(paymentMethodData);
  }
}
