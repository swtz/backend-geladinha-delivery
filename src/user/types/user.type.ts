import { WorkTime } from 'src/work-time/entities/work-time.entity';
import { User } from '../entities/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { DeliveryMan } from '../entities/delivery-man.entity';

export type UserResponseDtoType = Pick<User, 'id' | 'name' | 'phone'>;
export type UserType = Omit<
  User,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'secondPhone'
  | 'email'
  | 'workTime'
  | 'vouchers'
  | 'deliveryMan'
> &
  UserOptionalFieldsType;

type UserOptionalFieldsType = {
  secondPhone?: string;
  email?: string;
  workTime?: WorkTime;
  vouchers?: Voucher[];
  deliveryMan?: DeliveryMan;
};
