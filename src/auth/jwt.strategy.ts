import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './types/jwt-payload.type';
import { DeliveryManService } from 'src/delivery-man/delivery-man.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly deliveryManService: DeliveryManService,
  ) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_SECRET not found in .env file',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user || user.forceLogout) {
      throw new UnauthorizedException('Você precisa fazer login');
    }

    return user;
  }
}
