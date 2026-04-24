import { Motorcycle } from '../entities/motorcycle.entity';
import { DeliveryMan, User } from '../entities/user.entity';

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
