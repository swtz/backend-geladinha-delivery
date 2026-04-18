import { Repository } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { UserService } from '../user.service';

export class MotorcycleService {
  private readonly logger = new Logger(MotorcycleService.name);

  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateMotorcycleDto) {
    const owner = await this.userService.findOneByOrFail({ id: dto.owner });
    const driver = await this.userService.findOneMotoboyByOrFail({
      id: dto.driver,
    });

    const motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'> = {
      licensePlate: dto.licensePlate.toUpperCase(),
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      isActive: false,
      owner,
      driver,
    };

    return this.save(motorcycle);
  }

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
