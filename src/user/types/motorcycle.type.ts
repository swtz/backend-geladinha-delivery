import { Motorcycle } from '../entities/motorcycle.entity';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { ResponseMotorcycleDto } from '../dtos/motorcycle/response-motorcycle.dto';

type MotorcycleOptionalFieldsType = {
  displacement?: string;
  owner?: User;
  driver?: DeliveryMan;
};

export type MotorcycleType = Omit<
  Motorcycle,
  'id' | 'createdAt' | 'updatedAt' | 'displacement' | 'owner' | 'driver'
> &
  MotorcycleOptionalFieldsType;

export type SmallResponseMotorcycle = Pick<
  ResponseMotorcycleDto,
  'id' | 'brand' | 'color' | 'licensePlate'
>;
