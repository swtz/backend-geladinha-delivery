import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tip } from './entities/tip.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TipService {
  private readonly logger = new Logger(TipService.name);

  constructor(
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
  ) {}

  create(amount: number) {
    return this.save({ amount });
  }

  async save(tip: Partial<Tip>) {
    const created = await this.tipRepository.save(tip).catch((err: unknown) => {
      if (err instanceof Error) {
        this.logger.error('Erro ao criar gorjeta', err.stack);
      }

      throw new BadRequestException('Erro ao criar gorjeta');
    });

    return created;
  }
}
