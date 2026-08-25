import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOptionsOrder,
  FindOptionsOrderValue,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
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
import { setEntityRelationFieldAsNull } from 'src/common/utils/set-entity-relation-field-as-null';
import { Motorcycle } from '../entities/motorcycle.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly dataSource: DataSource,
  ) {}

  async failIfEmailExists(email: string) {
    if (!email) return;
    const exists = await this.findOneBy({ email });

    if (exists) {
      throw new ConflictException('Email já existe');
    }
  }

  async failIfPhoneExists(phone: string, isSecondPhone = false) {
    if (!phone) return;
    const exists = await this.findByPhone(phone, isSecondPhone);

    if (exists) {
      throw new ConflictException('Telefone já existe');
    }
  }

  async failIfNicknameExists(nickname: string) {
    if (!nickname) return;
    const exists = await this.userRepository.findOneBy({ nickname });

    if (exists) {
      throw new ConflictException('Apelido já existe');
    }
  }

  async create(dto: CreateUserDto, extManager?: EntityManager) {
    return this.dataSource.transaction(async srcManager => {
      const manager = extManager ? extManager : srcManager;
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
        placeCode: dto.placeCode,
      };

      const created = await this.save(user, manager);
      return this.findOneByOrFail({ id: created.id }, undefined, manager);
    });
  }

  async getAllRoleNames(userData: FindOptionsWhere<User>) {
    const user = await this.findOneByOrFail(userData);
    return user.roles.map(role => role.name);
  }

  async update(user: User, dto: UpdateUserDto, extManager?: EntityManager) {
    return this.dataSource.transaction(async srcManager => {
      const manager = extManager ? extManager : srcManager;
      const { nickname, phone, email, secondPhone, placeCode } = dto;

      user.name = dto.name ?? user.name;
      user.lastName = dto.lastName ?? user.lastName;

      if (nickname || phone || email || secondPhone || placeCode) {
        user.nickname = dto.nickname ?? user.nickname;
        user.phone = dto.phone ?? user.phone;
        user.secondPhone = dto.secondPhone ?? user.secondPhone;
        user.email = dto.email ?? user.email;
        user.placeCode = dto.placeCode ?? user.placeCode;
        user.forceLogout = true;
      }

      const updated = await this.save(user, manager);
      return this.findOneByOrFail({ id: updated.id }, undefined, manager);
    });
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
    manager?: EntityManager,
  ) {
    const user = await this.findOneByOrFail({ id }, undefined, manager);

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

    return this.save(user, manager);
  }

  async findAll({
    role,
    placeCode,
    orderParams,
  }: {
    role?: RoleEnum;
    placeCode: string;
    orderParams?: {
      [K in keyof FindOptionsOrder<User>]: FindOptionsOrderValue;
    };
  }) {
    return this.userRepository.find({
      where: {
        roles: { name: role },
        placeCode,
      },
      order: orderParams,
      relations: essencial,
    });
  }

  async findOneByOrFail(
    userData: FindOptionsWhere<User>,
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
    userData: FindOptionsWhere<User>,
    relations?: 'user-full' | 'motoboy-essencial' | 'motoboy-full',
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const aux: {
      userFields: FindOptionsRelations<User>;
      deliveryManFields: FindOptionsRelations<User> | true;
    } = { userFields: essencial, deliveryManFields: true };

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
    }

    return repo.findOne({
      where: userData,
      relations: {
        ...aux.userFields,
        deliveryMan: aux.deliveryManFields,
      },
    });
  }

  async findByPhone(
    phone: string,
    isSecondPhone = false,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    if (isSecondPhone) {
      const exists = await repo.findOneBy({ phone });

      if (exists) {
        return exists;
      }
      return repo.findOneBy({ secondPhone: phone });
    }
    return repo.findOneBy({ phone });
  }

  async remove(id: string, extManager?: EntityManager) {
    return this.dataSource.transaction(async intManager => {
      const manager = extManager ? extManager : intManager;
      const repo = manager ? manager.getRepository(User) : this.userRepository;
      const repo2 = manager && manager.getRepository(Motorcycle);
      const user = await this.findOneByOrFail(
        { id },
        'motoboy-essencial',
        manager,
      );

      if (user.deliveryMan?.motorcycle?.licensePlate) {
        await setEntityRelationFieldAsNull<Motorcycle>(
          Motorcycle,
          'driver',
          user.deliveryMan.motorcycle.id,
          repo2,
        );
      }

      await repo.delete({ id });
      return user;
    });
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
