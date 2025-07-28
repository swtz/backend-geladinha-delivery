import { Request } from 'express';
import { UserEntity } from 'src/user/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}
