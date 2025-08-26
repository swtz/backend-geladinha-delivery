import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super(reflector);
  }
  handleRequest<TUser = any>(
    err: any,
    user: User,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (!user || info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Você precisa fazer login');
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    console.log(requiredRoles);

    return super.handleRequest(err, user, info, context, status);
  }
}
