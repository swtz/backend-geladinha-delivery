import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RoleService } from 'src/common/role/role.service';
import { Role as RoleEnum, roles } from 'src/common/role/roles.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    if (dto.role === RoleEnum.Motoboy) {
      const motoboy = await this.createUserMotoboy(dto, newUser);
      motoboy.roles.push(role);
      console.log('criou motoboy');

      return this.save(motoboy);
    }

    const created = await this.userRepository
      .save(newUser)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o usuário', err.stack);
        }

        throw new BadRequestException('Erro ao criar o usuário');
      });
    const user = await this.findOneByOrFail({ id: created.id });

    user.roles.push(role);

    return this.save(user);
  }

  async createUserMotoboy(
    dto: CreateUserDto,
    newUser: {
      name: string;
      phone: string;
      email: string;
      password: string;
    },
  ) {
    const newMotoboy = {
      ...dto,
      ...newUser,
    };

    const created = await this.userRepository
      .save(newMotoboy)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o motoboy', err.stack);
        }

        throw new BadRequestException('Erro ao criar o motoboy');
      });
    return this.findOneByOrFail({ id: created.id });
  }

  createRoleForUser(roleName: RoleEnum) {
    return this.roleService.findOneOrCreate(roleName);
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!dto.name && !dto.email) {
      throw new BadRequestException('Dados não enviados');
    }

    const user = await this.findOneByOrFail({ id });

    user.name = dto.name ?? user.name;

    if (dto.email && dto.email !== user.email) {
      await this.failIfEmailExists(dto.email);
      user.email = dto.email;
      user.forceLogout = true;
    }

    return this.save(user);
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

  async remove(id: string) {
    const user = await this.findOneByOrFail({ id });
    await this.userRepository.delete({ id });
    return user;
  }

  async findOneByOrFail(userData: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: userData,
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
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

  save(user: User) {
    return this.userRepository.save(user);
  }
}
