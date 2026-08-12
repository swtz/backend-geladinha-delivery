import { DeliveryMan } from '../entities/delivery-man.entity';
import { Motorcycle } from '../entities/motorcycle.entity';
import { User } from '../entities/user.entity';

export type DeliveryManType = Omit<
  DeliveryMan,
  'id' | 'tips' | 'createdAt' | 'updatedAt'
>;

export type FindDeliveryManByUserDataType = Omit<
  Partial<DeliveryMan>,
  'user' | 'motorcycle'
> & {
  user?: Partial<User>;
  motorcycle?: Partial<Motorcycle>;
};
