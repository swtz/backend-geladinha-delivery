import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/user/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dtos/user/update-user.dto';
import { UpdatePasswordDto } from './dtos/user/update-password.dto';
import { RoleService } from 'src/common/role/role.service';
import { Role, Role as RoleEnum } from 'src/common/role/roles.enum';
import { essencial, full } from './data/relations/user';
import {
  essencial as mtbEssencial,
  full as mtbFull,
} from './data/relations/delivery-man';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { NewWorkTimeForRest } from 'src/work-time/types/new-work-time-for-rest';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { UserType } from './types/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async failIfEmailExists(email: string) {
    const exists = await this.findByEmail(email);

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

  async create(dto: CreateUserDto) {
    await this.failIfPhoneExists(dto.phone);
    await this.failIfNicknameExists(dto.nickname);

    if (dto.email) {
      await this.failIfEmailExists(dto.email);
    }

    if (dto.secondPhone) {
      await this.failIfPhoneExists(dto.secondPhone);
      await this.failIfPhoneExists(dto.secondPhone, true);
    }

    const role = await this.roleService.findOneOrCreate(dto.role);
    const hashedPassword = await this.hashingService.hash(dto.password);
    const user: UserType = {
      name: dto.name,
      lastName: dto.lastName,
      nickname: dto.nickname,
      phone: dto.phone,
      secondPhone: dto.secondPhone,
      email: dto.email,
      password: hashedPassword,
      forceLogout: false,
      roles: [role],
      workTime: dto.workTime
        ? await this.workTimeService.findOneOrCreate(dto.workTime)
        : undefined,
    };

    const created = await this.save(user);

    if (user.workTime) {
      await this.workTimeService.save({ ...user.workTime, user: created });
    }

    return this.findOneByOrFail({ id: created.id });
  }

  async getAllRoleNames(userData: Partial<User>) {
    const user = await this.findOneByOrFail(userData);
    return user.roles.map(role => role.name);
  }

  async update(user: User, dto: UpdateUserDto) {
    user.name = dto.name ?? user.name;
    user.lastName = dto.lastName ?? user.lastName;

    if (dto.nickname && dto.nickname !== user.nickname) {
      await this.failIfNicknameExists(dto.nickname);
      user.nickname = dto.nickname;
      user.forceLogout = true;
    }

    if (dto.email && dto.email !== user.email) {
      await this.failIfEmailExists(dto.email);
      user.email = dto.email;
      user.forceLogout = true;
    }

    if (dto.phone && dto.phone !== user.phone) {
      await this.failIfPhoneExists(dto.phone);
      await this.failIfPhoneExists(dto.phone, true);
      user.phone = dto.phone;
      user.forceLogout = true;
    }

    if (dto.secondPhone && dto.secondPhone !== user.secondPhone) {
      await this.failIfPhoneExists(dto.secondPhone);
      await this.failIfPhoneExists(dto.secondPhone, true);
      user.secondPhone = dto.secondPhone;
    }

    if (dto.workTime) {
      const { id, shift, initHour, endHour } = dto.workTime;
      const hasAllData = !!(shift && initHour && endHour);
      const hasSomeData = !!(shift || initHour || endHour);
      const hasWorkTime = user.workTime;

      if (id) {
        user.workTime = await this.workTimeService
          .findOneBy({ id, isShared: true })
          .then(result => {
            if (!result) {
              return this.workTimeService.findOneOwnedByOrFail(
                user,
                { id },
                false,
              );
            }
            return result;
          });
      } else if (hasAllData) {
        if (!hasWorkTime || dto.workTime.shift === Shift.Custom) {
          const created: NewWorkTimeForRest = {
            shift,
            initHour,
            endHour,
            isDefault: false,
            isShared: false,
          };

          user.workTime = await this.workTimeService.save({
            ...created,
            user,
          });
        } else {
          user.workTime = await this.workTimeService.update(
            user.workTime.id,
            dto.workTime,
          );
        }
      } else if (hasSomeData) {
        user.workTime = await this.workTimeService.update(
          user.workTime.id,
          dto.workTime,
        );
      } else {
        throw new InternalServerErrorException('ERROR FROM WORK TIME FRAME');
      }
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
  ) {
    const user = await this.findOneBy(userData, relations);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findOneBy(
    userData: Partial<User>,
    relations?: 'user-full' | 'motoboy-essencial' | 'motoboy-full',
  ) {
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

    return this.userRepository.findOne({
      where: userData,
      relations: { ...aux.userFields, deliveryMan: aux.deliveryManFields },
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({
      email,
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

  findById(id: string) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  async remove(id: string) {
    const user = await this.findOneByOrFail({ id });
    await this.userRepository.delete({ id });
    return user;
  }

  async save(user: Partial<User>) {
    return this.userRepository.save(user);
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
