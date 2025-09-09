import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Repository } from 'typeorm';
import { BadRequestException, Logger } from '@nestjs/common';

export class PaymentMethodService {
  private readonly logger = new Logger(PaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async save(paymentMethod: Partial<PaymentMethod>) {
    const created = await this.paymentMethodRepository
      .save(paymentMethod)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar método de pagamento', err.stack);
        }

        throw new BadRequestException('Erro ao criar método de pagamento');
      });

    return created;
  }
}
