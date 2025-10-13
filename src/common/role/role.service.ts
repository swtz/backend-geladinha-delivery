import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role as RoleEntity } from './entities/role.entity';
import { Role } from './roles.enum';
import { generateBadRequestException } from '../generate-exception';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(name: Role) {
    return this.save({ name });
  }

  async findOneOrCreate(name: Role) {
    const role = await this.findOneByName(name);

    if (!role) {
      const created = await this.create(name);
      return this.findOneByNameOrFail(created.name);
    }

    return role;
  }

  findOneByName(name: Role) {
    return this.roleRepository.findOne({
      where: { name },
      relations: { users: true },
    });
  }

  async findOneByNameOrFail(name: Role) {
    const role = await this.findOneByName(name);

    if (!role) {
      throw new NotFoundException('Essa função não existe');
    }

    return role;
  }

  async save(roleData: Partial<RoleEntity>) {
    const http400 = generateBadRequestException('Erro ao criar função');
    const created = await this.roleRepository
      .save(roleData)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
