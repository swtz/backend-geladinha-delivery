import { Repository } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { MotorcycleType } from '../types/motorcycle';
import { DeliveryMan, User } from '../entities/user.entity';

@Injectable()
export class MotorcycleService {
  private readonly logger = new Logger(MotorcycleService.name);

  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
  ) {}

  async failIfLicensePlateExists(licensePlate: string) {
    const exists = await this.motorcycleRepository.existsBy({
      licensePlate,
    });

    if (exists) {
      throw new BadRequestException('Essa placa já existe');
    }
  }

  async create(dto: CreateMotorcycleDto, owner: User, driver: DeliveryMan) {
    const licensePlate = dto.licensePlate.toUpperCase();

    await this.failIfLicensePlateExists(licensePlate);

    const motorcycle: MotorcycleType = {
      licensePlate,
      brand: dto.brand,
      model: dto.model,
      displacement: dto.displacement,
      year: dto.year,
      color: dto.color,
      isActive: dto.isActive ? dto.isActive : false,
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
