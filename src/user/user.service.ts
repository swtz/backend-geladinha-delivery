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
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RoleService } from 'src/common/role/role.service';
import { Role as RoleEnum, roles } from 'src/common/role/roles.enum';

type NewUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

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
  ) {}

  async failIfEmailExists(email: string) {
    const exists = await this.findByEmail(email);

    if (exists) {
      throw new ConflictException('Email já existe');
    }
  }

  async failIfPhoneExists(phone: string) {
    const exists = await this.findByPhone(phone);

    if (exists) {
      throw new ConflictException('Telefone já existe');
    }
  }

  async create(dto: CreateUserDto) {
    await this.failIfEmailExists(dto.email);
    await this.failIfPhoneExists(dto.phone);

    if (!dto.role || !roles.includes(dto.role)) {
      throw new BadRequestException('Função inválida');
    }

    const role = await this.createRoleForUser(dto.role);
    const hashedPassword = await this.hashingService.hash(dto.password);
    const newUser = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      password: hashedPassword,
    };

    const user =
      dto.role === RoleEnum.Motoboy
        ? await this.createUserMotoboy(dto, newUser)
        : await this.createUserOperator(newUser);

    user.roles.push(role);

    return this.save(user);
  }

  async createUserMotoboy(dto: CreateUserDto, newUser: NewUser) {
    if (!dto.motorcycle && !dto.daily) {
      throw new BadRequestException(
        'Campo motocicleta e diária são obrigatórios para o motoboy',
      );
    }

    const newMotoboy = {
      ...dto,
      ...newUser,
    };
    const created = await this.deliveryManRepository
      .save(newMotoboy)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o motoboy', err.stack);
        }

        throw new BadRequestException('Erro ao criar o motoboy');
      });

    return this.findOneByOrFail({ id: created.id });
  }

  async createUserOperator(newUser: NewUser) {
    const created = await this.userRepository
      .save(newUser)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o usuário', err.stack);
        }

        throw new BadRequestException('Erro ao criar o usuário');
      });

    return this.findOneByOrFail({ id: created.id });
  }

  createRoleForUser(roleName: RoleEnum) {
    return this.roleService.findOneOrCreate(roleName);
  }

  async getAllRoleNames(userData: Partial<User>) {
    const user = await this.findOneByOrFail(userData);
    return user.roles.map(role => role.name);
  }

  async update(id: string, dto: UpdateUserDto) {
    const existsUserData = dto.name || dto.email || dto.phone;
    const existsMotoboyData = existsUserData || dto.motorcycle || dto.daily;
    const entity = await this.findOneByOrFail({ id });
    const isMotoboy = entity.roles.some(role => RoleEnum.Motoboy === role.name);
    const isOperator = entity.roles.some(
      role => RoleEnum.Operator === role.name,
    );
    const assignRoleError = new BadRequestException(
      'Não é possível atribuir duas funções a um usuário',
    );

    if (isMotoboy && dto.role === RoleEnum.Operator) {
      throw assignRoleError;
    }

    if (isOperator && dto.role === RoleEnum.Motoboy) {
      throw assignRoleError;
    }

    const user = isMotoboy
      ? await this.updateUserMotoboy(!!existsMotoboyData, dto, entity)
      : entity;

    if (!isMotoboy && !existsUserData) {
      throw new BadRequestException('Dados do operador não enviados');
    }

    user.name = dto.name ?? user.name;

    if (dto.email && dto.email !== user.email) {
      await this.failIfEmailExists(dto.email);
      user.email = dto.email;
      user.forceLogout = true;
    }

    if (dto.phone && dto.phone !== user.phone) {
      await this.failIfPhoneExists(dto.phone);
      user.phone = dto.phone;
    }

    if (dto.role) {
      const role = await this.createRoleForUser(dto.role);
      user.roles.push(role);
      user.forceLogout = true;
    }

    return this.save(user);
  }

  async updateUserMotoboy(
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
    motoboy.tip = dto.tip ?? motoboy.tip;

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

    return this.save(user);
  }

  async findAllMotoboy() {
    const motoboys = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['roles', 'vouchers'],
    });

    return motoboys;
  }

  async findOneByOrFail(userData: Partial<User>) {
    const user = await this.findOneBy(userData);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findOneBy(userData: Partial<User>) {
    return this.userRepository.findOne({
      where: userData,
      relations: ['roles', 'vouchers'],
    });
  }

  async findOneMotoboyByOrFail(userData: Partial<User>) {
    const motoboy = await this.deliveryManRepository.findOne({
      where: userData,
      relations: ['roles', 'vouchers'],
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

  findByPhone(phone: string) {
    return this.userRepository.findOneBy({
      phone,
    });
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

  save(user: User) {
    return this.userRepository.save(user);
  }
}
