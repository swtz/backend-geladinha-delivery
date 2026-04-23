import { WorkTime } from 'src/work-time/entities/work-time.entity';
import { User } from '../entities/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';

export type UserType = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'secondPhone' | 'workTime' | 'vouchers'
> &
  UserOptionalFieldsType;

type UserOptionalFieldsType = {
  secondPhone?: string;
  workTime?: WorkTime;
  vouchers?: Voucher[];
};
