import { User } from 'src/user/entities/user.entity';
import { FindOperator } from 'typeorm';

export interface Query {
  createdAt?: FindOperator<Date>;
}

export class VoucherFindAllQuery implements Query {
  user?: Partial<User>;
  createdBy?: Partial<User>;
  createdAt?: FindOperator<Date>;
}
