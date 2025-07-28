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
    const exists = await this.userRepository.exists({
      where: {
        email: dto.email,
      },
    });

    if (exists) {
      throw new ConflictException('Email já existe');
    }

    console.log(dto);

    return dto;
  }
}
