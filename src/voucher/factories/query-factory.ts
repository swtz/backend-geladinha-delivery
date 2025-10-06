import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';

export interface Query {
  createdAt?: FindOperator<Date>;
}

export class VoucherFindAllQuery implements Query {
  user?: Partial<User>;
  createdBy?: Partial<User>;
  createdAt?: FindOperator<Date>;
}

type DateParams = {
  fromDate?: Date;
  toDate?: Date;
};

export type FindAllParams = {
  user?: User;
} & DateParams;

abstract class AbstractMethod {
  getDatePeriod(fromDate?: Date, toDate?: Date) {
    if (fromDate !== undefined && toDate !== undefined) {
      return Between(fromDate, toDate);
    }
  }

  abstract factoryMethod(params: FindAllParams): Query;
}
