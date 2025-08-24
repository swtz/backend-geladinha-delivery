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

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(name: Role) {
    const created = await this.roleRepository
      .save({ name })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar a função', err.stack);
        }

        throw new BadRequestException('Erro ao criar a função');
      });

    return created;
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
      relations: ['users'],
    });
  }

  async findOneByNameOrFail(name: Role) {
    const role = await this.findOneByName(name);

    if (!role) {
      throw new NotFoundException('Essa função não existe');
    }

    return role;
  }

  save(role: RoleEntity) {
    return this.roleRepository.save(role);
  }
}
