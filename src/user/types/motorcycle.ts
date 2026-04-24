import { Motorcycle } from '../entities/motorcycle.entity';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';

export type MotorcycleType = Omit<
  Motorcycle,
  'id' | 'createdAt' | 'updatedAt' | 'displacement' | 'owner' | 'driver'
> &
  MotorcycleOptionalFieldsType;

type MotorcycleOptionalFieldsType = {
  displacement: string | undefined;
  owner: User | undefined;
  driver: DeliveryMan | undefined;
};
