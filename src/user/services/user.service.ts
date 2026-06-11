import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UpdatePasswordDto } from '../dtos/user/update-password.dto';
import { RoleService } from 'src/common/role/role.service';
import { Role, Role as RoleEnum } from 'src/common/role/roles.enum';
import { essencial, full } from '../data/relations/user';
import {
  essencial as mtbEssencial,
  full as mtbFull,
} from '../data/relations/delivery-man';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
  ) {}

  async failIfEmailExists(email: string) {
    const exists = await this.findOneBy({ email });

    if (exists) {
      throw new ConflictException('Email já existe');
    }
  }

  async failIfPhoneExists(phone: string, isSecondPhone = false) {
    const exists = await this.findByPhone(phone, isSecondPhone);

    if (exists) {
      throw new ConflictException('Telefone já existe');
    }
  }

  async failIfNicknameExists(nickname: string) {
    const exists = await this.userRepository.findOneBy({ nickname });

    if (exists) {
      throw new ConflictException('Apelido já existe');
    }
  }

  async create(dto: CreateUserDto, manager?: EntityManager) {
    const role = await this.roleService.findOneOrCreate(dto.role, manager);
    const hashedPassword = await this.hashingService.hash(dto.password);

    const user = {
      name: dto.name,
      lastName: dto.lastName,
      nickname: dto.nickname,
      phone: dto.phone,
      secondPhone: dto.secondPhone,
      email: dto.email,
      password: hashedPassword,
      forceLogout: false,
      roles: [role],
    };

    const created = await this.save(user, manager);
    return this.findOneByOrFail({ id: created.id }, undefined, manager);
  }

  async getAllRoleNames(userData: Partial<User>) {
    const user = await this.findOneByOrFail(userData);
    return user.roles.map(role => role.name);
  }

  async update(user: User, dto: UpdateUserDto) {
    const { nickname, phone, email, secondPhone } = dto;

    user.name = dto.name ?? user.name;
    user.lastName = dto.lastName ?? user.lastName;

    if (nickname || phone || email || secondPhone) {
      user.nickname = dto.nickname ?? user.nickname;
      user.phone = dto.phone ?? user.phone;
      user.secondPhone = dto.secondPhone ?? user.secondPhone;
      user.email = dto.email ?? user.email;
      user.forceLogout = true;
    }

    const updated = await this.save(user);
    return this.findOneByOrFail({ id: updated.id });
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.findOneByOrFail({ id });

    const validPassword = await this.hashingService.compare(
      dto.currentPassword,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    const hashedPassword = await this.hashingService.hash(dto.newPassword);

    user.password = hashedPassword;
    user.forceLogout = true;

    return this.save(user);
  }

  async findAll({ role }: { role?: RoleEnum }) {
    return this.userRepository.find({
      where: {
        roles: { name: role },
      },
      order: { createdAt: 'DESC' },
      relations: essencial,
    });
  }

  async findOneByOrFail(
    userData: Partial<User>,
    relations?: 'user-full' | 'motoboy-essencial' | 'motoboy-full',
    manager?: EntityManager,
  ) {
    const user = await this.findOneBy(userData, relations, manager);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findOneBy(
    userData: Partial<User>,
    relations?: 'user-full' | 'motoboy-essencial' | 'motoboy-full',
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const aux: {
      userFields: Record<string, any>;
      deliveryManFields: Record<string, any>;
    } = { userFields: {}, deliveryManFields: {} };

    if (relations) {
      switch (relations) {
        case 'motoboy-essencial':
          aux.deliveryManFields = mtbEssencial;
          break;
        case 'motoboy-full':
          aux.deliveryManFields = mtbFull;
          break;
        case 'user-full':
          aux.userFields = full;
      }
    } else {
      aux.userFields = essencial;
    }

    return repo.findOne({
      where: userData,
      relations: { ...aux.userFields, deliveryMan: aux.deliveryManFields },
    });
  }

  findByPhone(phone: string, isSecondPhone = false) {
    const qo: { phone: undefined | string; secondPhone: undefined | string } = {
      phone,
      secondPhone: undefined,
    };

    if (isSecondPhone) {
      qo.phone = undefined;
      qo.secondPhone = phone;
    }

    return this.userRepository.findOneBy(qo);
  }

  async remove(id: string) {
    const user = await this.findOneByOrFail({ id });
    await this.userRepository.delete({ id });
    return user;
  }

  async save(user: Partial<User>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    return repo.save(user);
  }

  async getUserAndEntityAuth(user: User, id: string) {
    const entity = await this.findOneByOrFail({ id });
    const userRoles = await this.getAllRoleNames({ id: user.id });
    const entityRoles = await this.getAllRoleNames({
      id: entity.id,
    });
    const isLoggedUserOperator = userRoles.includes(Role.Operator);
    const isLoggedUserAdmin = userRoles.includes(Role.Admin);
    const isLoggedUserMotoboy = userRoles.includes(Role.Motoboy);
    const isEntityMotoboy = entityRoles.includes(Role.Motoboy);

    return {
      entity,
      userRoles,
      entityRoles,
      isLoggedUserOperator,
      isLoggedUserAdmin,
      isLoggedUserMotoboy,
      isEntityMotoboy,
    };
  }
}
