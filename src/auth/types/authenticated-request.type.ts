import { Request } from 'express';
import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';
import { UserEntity } from 'src/user/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: UserEntity | DeliveryManEntity;
}
