import { Motorcycle } from '../entities/motorcycle.entity';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';

export type MotorcycleType = Omit<
  Motorcycle,
  'id' | 'createdAt' | 'updatedAt' | 'displacement' | 'owner' | 'driver'
> &
  MotorcycleOptionalFieldsType;

type MotorcycleOptionalFieldsType = {
  displacement?: string;
  owner?: User;
  driver?: DeliveryMan;
};
