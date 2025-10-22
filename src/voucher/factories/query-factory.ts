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
  from?: Date;
  to?: Date;
};

export type FindAllParams = {
  user?: User;
} & DateParams;

abstract class AbstractMethod {
  getDatePeriod(from?: Date, to?: Date) {
    if (from !== undefined && to !== undefined) {
      return Between(from, to);
    }
  }

  abstract factoryMethod(params: FindAllParams): Query;
}

export class VoucherFindAllFactory extends AbstractMethod {
  factoryMethod({ user, from, to }: FindAllParams): Query {
    const queryObject = new VoucherFindAllQuery();

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.user = { id: user?.id };

    return queryObject;
  }
}
