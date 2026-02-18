import { Repository } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { generateBadRequestException } from 'src/common/generate-exception';

export class MotorcycleService {
  private readonly logger = new Logger(MotorcycleService.name);

  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
  ) {}

  async save(motorcycle: Partial<Motorcycle>) {
    const http400 = generateBadRequestException('Erro ao salvar a moto');

    const created = this.motorcycleRepository
      .save(motorcycle)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
