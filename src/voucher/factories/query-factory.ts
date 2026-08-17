import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator, FindOptionsWhere } from 'typeorm';
import { Voucher } from '../enums/voucher.enum';

export interface Query {
  createdAt?: FindOperator<Date>;
}

export class VoucherFindAllQuery implements Query {
  user?: FindOptionsWhere<User>;
  createdBy?: FindOptionsWhere<User>;
  createdAt?: FindOperator<Date>;
}

type DateParams = {
  from?: Date;
  to?: Date;
};

export type FindAllParams = {
  type?: Voucher;
  name?: string;
  phone?: string;
  id?: string;
  userData?: FindOptionsWhere<User>;
} & DateParams;

abstract class AbstractMethod {
  getDatePeriod(from?: Date, to?: Date) {
    if (from !== undefined && to !== undefined) {
      return Between(from, to);
    }
  }

  abstract factoryMethod(params: FindAllParams): VoucherFindAllQuery;
}

export class VoucherFindAllFactory extends AbstractMethod {
  factoryMethod({
    userData,
    from,
    to,
    name,
    phone,
    id,
    type,
  }: FindAllParams): VoucherFindAllQuery {
    const queryObject = new VoucherFindAllQuery();
    const data = userData === undefined ? { name, phone, id } : userData;

    queryObject.createdAt = this.getDatePeriod(from, to);

    if (!type || type === Voucher.DeliveryMan) {
      queryObject.user = { deliveryMan: { user: data } };
      return queryObject;
    }

    if (type === Voucher.User || type === Voucher.CreatedBy) {
      queryObject.user = data;
      return queryObject;
    }

    queryObject[type] = { id };

    return queryObject;
  }
}
