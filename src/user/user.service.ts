import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryMan, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/user/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dtos/user/update-user.dto';
import { UpdatePasswordDto } from './dtos/user/update-password.dto';
import { RoleService } from 'src/common/role/role.service';
import { Role, Role as RoleEnum, roles } from 'src/common/role/roles.enum';
import { essencial, full } from './data/relations/user';
import { generateBadRequestException } from 'src/common/generate-exception';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { NewWorkTimeForRest } from 'src/work-time/types/new-work-time-for-rest';
import { Shift } from 'src/common/enums/work-shifts.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DeliveryMan)
    private readonly deliveryManRepository: Repository<DeliveryMan>,
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
    await this.failIfEmailExists(dto.email);
    await this.failIfPhoneExists(dto.phone);
    await this.failIfNicknameExists(dto.nickname);

    if (dto.secondPhone) {
      await this.failIfPhoneExists(dto.secondPhone);
      await this.failIfPhoneExists(dto.secondPhone, true);
    }

    if (!dto.role || !roles.includes(dto.role)) {
      throw new BadRequestException('Função inválida');
    }

    const role = await this.roleService.findOneOrCreate(dto.role);
    const hashedPassword = await this.hashingService.hash(dto.password);
    const newUser = {
      name: dto.name,
      lastName: dto.lastName,
      nickname: dto.nickname,
      phone: dto.phone,
      secondPhone: dto.secondPhone,
      email: dto.email,
      password: hashedPassword,
      roles: [role],
      workTime: dto.workTime
        ? await this.workTimeService.findOneOrCreate(dto.workTime)
        : undefined,
    };

    if (dto.role === RoleEnum.Motoboy) {
      const http400 = generateBadRequestException(
        'Informe o valor da diária do motoboy',
      );

      if (!dto.daily) {
        throw http400;
      }

      const newMotoboy = {
        ...newUser,
        daily: dto.daily,
      };

      const created = await this.saveDeliveryMan(newMotoboy);
      return this.findOneByOrFail({ id: created.id });
    }

    const created = await this.saveUser(newUser);

    if (newUser.workTime) {
      await this.workTimeService.save({ ...newUser.workTime, user: created });
    }

    return this.findOneByOrFail({ id: created.id });
  }

  async getAllRoleNames(userData: Partial<User>) {
    const user = await this.findOneByOrFail(userData);
    return user.roles.map(role => role.name);
  }

  async update(user: User, dto: UpdateUserDto) {
    const userFields = Object.keys(dto)
      .filter(key => key !== 'motorcycle')
      .filter(key => key !== 'daily');
    const motoboyFields = Object.keys(dto).filter(
      key => key === 'motorcycle' || 'daily',
    );

    const existsUserData =
      userFields.filter(key => Boolean(dto[key])).length > 0;
    const existsMotoboyData =
      motoboyFields.filter(key => Boolean(dto[key])).length > 0;

    const authFlags = await this.getUserAndEntityAuth(user, user.id);
    const assignRoleError = new BadRequestException(
      'Não é possível atribuir duas funções a um usuário',
    );

    if (authFlags.isLoggedUserMotoboy && dto.role === RoleEnum.Operator) {
      throw assignRoleError;
    }

    if (
      (authFlags.isLoggedUserOperator || authFlags.isLoggedUserAdmin) &&
      dto.role === RoleEnum.Motoboy
    ) {
      throw assignRoleError;
    }

    const entity = authFlags.isLoggedUserMotoboy
      ? await this.updateMotoboyFields(!!existsMotoboyData, dto, user)
      : user;

    if (!authFlags.isLoggedUserMotoboy && !existsUserData) {
      throw new BadRequestException('Dados não enviados');
    }

    entity.name = dto.name ?? entity.name;

    if (dto.email && dto.email !== entity.email) {
      await this.failIfEmailExists(dto.email);
      entity.email = dto.email;
      entity.forceLogout = true;
    }

    if (dto.phone && dto.phone !== entity.phone) {
      await this.failIfPhoneExists(dto.phone);
      entity.phone = dto.phone;
      entity.forceLogout = true;
    }

    if (
      dto.role &&
      !authFlags.userRoles.includes(dto.role) &&
      authFlags.isLoggedUserAdmin
    ) {
      const role = await this.roleService.findOneOrCreate(dto.role);
      entity.roles.push(role);
      entity.forceLogout = true;
    }

    if (dto.workTime) {
      const { id, shift, initHour, endHour } = dto.workTime;
      const hasAllData = !!(shift && initHour && endHour);
      const hasSomeData = !!(shift || initHour || endHour);
      const hasWorkTime = entity.workTime;

      if (id) {
        entity.workTime = await this.workTimeService
          .findOneBy({ id, isShared: true })
          .then(result => {
            if (!result) {
              return this.workTimeService.findOneOwnedByOrFail(
                entity,
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

          entity.workTime = await this.workTimeService.save({
            ...created,
            user: entity,
          });
        } else {
          entity.workTime = await this.workTimeService.update(
            entity.workTime.id,
            dto.workTime,
          );
        }
      } else if (hasSomeData) {
        entity.workTime = await this.workTimeService.update(
          entity.workTime.id,
          dto.workTime,
        );
      } else {
        throw new BadRequestException('Dados não enviados');
      }
    }

    const updated = await this.saveUser(entity);
    return this.findOneByOrFail({ id: updated.id }, false);
  }

  async updateMotoboyFields(
    existsMotoboyData: boolean,
    dto: UpdateUserDto,
    user: User,
  ) {
    if (!existsMotoboyData) {
      throw new BadRequestException('Dados do motoboy não enviados');
    }

    const motoboy = await this.findOneMotoboyByOrFail({ id: user.id });

    motoboy.motorcycle = dto.motorcycle ?? motoboy.motorcycle;
    motoboy.daily = dto.daily ?? motoboy.daily;

    return motoboy;
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

    return this.saveUser(user);
  }

  async findAllMotoboy() {
    const motoboys = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: essencial,
    });

    return motoboys;
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

  async findOneByOrFail(userData: Partial<User>, relations = true) {
    const user = await this.findOneBy(userData, relations);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findOneBy(userData: Partial<User>, relations = true) {
    const fields = relations ? full : essencial;
    return this.userRepository.findOne({
      where: userData,
      relations: fields,
    });
  }

  async findOneMotoboyByOrFail(userData: Partial<User>, relations = true) {
    const fields = relations ? full : essencial;
    const motoboy = await this.deliveryManRepository.findOne({
      where: userData,
      relations: fields,
    });

    if (!motoboy) {
      throw new NotFoundException('Motoboy não encontrado');
    }

    return motoboy;
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

  async saveUser(user: Partial<User>) {
    const http400 = generateBadRequestException('Erro ao criar o usuário');
    const created = await this.userRepository
      .save(user)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }

  async saveDeliveryMan(user: Partial<DeliveryMan>) {
    const http400 = generateBadRequestException('Erro ao criar o motoboy');
    const created = await this.deliveryManRepository
      .save(user)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
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
