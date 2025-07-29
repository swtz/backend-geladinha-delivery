import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingService,
  ) {}

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);

    if (exists) {
      throw new ConflictException('Email já existe');
    }

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
