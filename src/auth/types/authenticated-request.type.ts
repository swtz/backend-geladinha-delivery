import { Request } from 'express';
import { DeliveryMan } from 'src/delivery-man/entities/delivery-man.entity';
import { User } from 'src/user/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User | DeliveryMan;
}
