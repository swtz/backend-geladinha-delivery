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
    const year = dto.year;

    // verificar se licensePlate é valida
    const licensePlate = dto.licensePlate;

    return this.save({ ...dto, year, licensePlate, owner, driver });
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
