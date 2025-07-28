import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/hashing.service';

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

  findByEmail(email: string) {
    return this.userRepository.findOneBy({
      email,
    });
  }
}
