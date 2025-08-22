import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserService } from 'src/user/user.service';
import { DeliveryManService } from 'src/delivery-man/delivery-man.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { User } from 'src/user/entities/user.entity';
import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly deliveryManService: DeliveryManService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    let user: User | DeliveryManEntity | null;

    if (dto.operator && dto.deliveryMan) {
      throw new BadRequestException('Escolha somente uma função');
    }

    if (dto.operator) {
      user = await this.userService.findByEmail(dto.email);
    } else if (dto.deliveryMan) {
      user = await this.deliveryManService.findByEmail(dto.email);
    } else {
      user = null;
    }

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

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(jwtPayload);

    user.forceLogout = false;

    if (user instanceof User) {
      await this.userService.save(user);
    } else {
      await this.deliveryManService.save(user);
    }

    return { accessToken };
  }
}
