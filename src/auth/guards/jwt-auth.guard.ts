import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';

export class JwtAuthGuard extends AuthGuard('jwt') {
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

    console.log(user);

    return super.handleRequest(err, user, info, context, status);
  }
}
