import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    const error = new UnauthorizedException('Usuário ou senha inválidos');

    if (!user) {
      throw error;
    }

    const validPassword = await this.hashingService.compare(
      dto.password,
      user.password,
    );

    if (!validPassword) {
      throw error;
    }

    return dto;
  }
}
