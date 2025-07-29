import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingService,
  ) {}

  async failIfEmailExists(email: string) {
    const exists = await this.findByEmail(email);

    if (exists) {
      throw new ConflictException('Email já existe');
    }
  }

  async create(dto: CreateUserDto) {
    await this.failIfEmailExists(dto.email);

    const hashedPassword = await this.hashingService.hash(dto.password);
    const newUser = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    };

    const created = this.userRepository.save(newUser);

    return created;
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

  async findOneByOrFail(userData: Partial<UserEntity>) {
    const user = await this.userRepository.findOneBy(userData);

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

  findById(id: string) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  save(user: UserEntity) {
    return this.userRepository.save(user);
  }
}
