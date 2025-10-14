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
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super(reflector);
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
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
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return super.handleRequest(err, user, info, context, status);
    }

    const roles = user.roles.map(role => role.name);
    const userRole = roles.some(role => requiredRoles.includes(role));

    if (!userRole) {
      throw new UnauthorizedException('Acesso negado');
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
