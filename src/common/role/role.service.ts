import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role as RoleEntity } from './entities/role.entity';
import { Role } from './roles.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  create(name: Role) {
    return this.roleRepository.save({ name });
  }
}
