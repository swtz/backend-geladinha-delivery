import { DeliveryMan } from '../entities/delivery-man.entity';
import { User } from '../entities/user.entity';

export type DeliveryManType = Omit<
  DeliveryMan,
  'id' | 'tips' | 'createdAt' | 'updatedAt'
>;

export type FindDeliveryManByUserDataType = Omit<
  Partial<DeliveryMan>,
  'user'
> & {
  user: Partial<User>;
};
