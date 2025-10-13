import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethod as PaymentMethodEnum } from '../enums/payment-methods.enum';
import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class PaymentMethodService {
  private readonly logger = new Logger(PaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findOneOrCreate(name: PaymentMethodEnum) {
    const paymentMethod = await this.findOneBy({ name });

    if (!paymentMethod) {
      const created = await this.save({ name });
      return this.findOneByOrFail({ id: created.id });
    }

    return paymentMethod;
  }

  findOneBy(paymentMethodData: Partial<PaymentMethod>) {
    return this.paymentMethodRepository.findOne({
      where: paymentMethodData,
      relations: { deliveries: true },
    });
  }

  async findOneByOrFail(paymentMethodData: Partial<PaymentMethod>) {
    const paymentMethod = await this.findOneBy(paymentMethodData);

    if (!paymentMethod) {
      throw new NotFoundException('Método de pagamento não existe');
    }

    return paymentMethod;
  }

  async save(paymentMethodData: Partial<PaymentMethod>) {
    const http400 = generateBadRequestException(
      'Erro ao criar método de pagamento',
    );
    const created = await this.paymentMethodRepository
      .save(paymentMethodData)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
