import { EntityManager, Repository } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { MotorcycleType } from '../types/motorcycle.type';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { essencial, full } from '../data/relations/delivery-man';
import { UpdateMotorcycleDto } from '../dtos/motorcycle/update-motorcycle.dto';

@Injectable()
export class MotorcycleService {
  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
  ) {}

  async failIfLicensePlateExists(
    licensePlate: string,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Motorcycle)
      : this.motorcycleRepository;
    const exists = await repo.existsBy({
      licensePlate,
    });

    if (exists) {
      throw new BadRequestException('Essa placa já existe');
    }
  }

  async create(
    dto: CreateMotorcycleDto,
    owner?: User,
    driver?: DeliveryMan,
    manager?: EntityManager,
  ) {
    const licensePlate = dto.licensePlate.toUpperCase();

    await this.failIfLicensePlateExists(licensePlate, manager);

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
    const created = await this.save(motorcycle, manager);

    return this.findOneByOrFail({ id: created.id }, true, manager);
  }

  async update(id: string, dto: UpdateMotorcycleDto, manager?: EntityManager) {
    const motorcycle = await this.findOneByOrFail({ id }, true, manager);
    motorcycle.brand = dto.brand ?? motorcycle.brand;
    motorcycle.color = dto.color ?? motorcycle.color;
    motorcycle.model = dto.model ?? motorcycle.model;
    motorcycle.year = dto.year ?? motorcycle.year;
    motorcycle.displacement = dto.displacement ?? motorcycle.displacement;
    motorcycle.isActive = dto.isActive ?? motorcycle.isActive;

    const updated = await this.save(motorcycle, manager);
    return this.findOneByOrFail({ id: updated.id }, true, manager);
  }

  async findOneByOrFail(
    motorcycleData: Partial<Motorcycle>,
    relations = true,
    manager?: EntityManager,
  ) {
    const motorcycle = await this.findOneBy(motorcycleData, relations, manager);

    if (!motorcycle) {
      throw new NotFoundException('Essa moto não existe');
    }

    return motorcycle;
  }

  findOneBy(
    motorcycleData: Partial<Motorcycle>,
    relations = true,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Motorcycle)
      : this.motorcycleRepository;
    const fields = relations ? full : essencial;
    return repo.findOne({
      where: motorcycleData,
      relations: { owner: true, driver: fields },
    });
  }

  async remove(id: string) {
    const motorcycle = await this.findOneByOrFail({ id });
    await this.motorcycleRepository.delete({ id });
    return motorcycle;
  }

  async save(motorcycle: Partial<Motorcycle>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Motorcycle)
      : this.motorcycleRepository;
    return repo.save(motorcycle);
  }
}
