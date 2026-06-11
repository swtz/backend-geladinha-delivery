import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
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

  async create(name: Role, manager?: EntityManager) {
    return this.save({ name }, manager);
  }

  async findOneOrCreate(name: Role, manager?: EntityManager) {
    const role = await this.findOneByName(name, manager);

    if (!role) {
      const created = await this.create(name, manager);
      return this.findOneByNameOrFail(created.name, manager);
    }

    return role;
  }

  findOneByName(name: Role, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(RoleEntity)
      : this.roleRepository;

    return repo.findOne({
      where: { name },
      relations: { users: true },
    });
  }

  async findOneByNameOrFail(name: Role, manager?: EntityManager) {
    const role = await this.findOneByName(name, manager);

    if (!role) {
      throw new NotFoundException('Essa função não existe');
    }

    return role;
  }

  async save(roleData: Partial<RoleEntity>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(RoleEntity)
      : this.roleRepository;
    return repo.save(roleData);
  }
}
