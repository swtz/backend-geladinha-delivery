import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';
import { Voucher } from '../enums/voucher.enum';
import { FindDeliveryManByUserDataType } from 'src/user/types/delivery-man.type';

export interface Query {
  createdAt?: FindOperator<Date>;
}

export class VoucherFindAllQuery implements Query {
  user?: Partial<
    Omit<User, 'deliveryMan'> & {
      deliveryMan: FindDeliveryManByUserDataType;
    }
  >;
  createdBy?: Partial<User>;
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
  userData?: Partial<User>;
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
  factoryMethod({
    userData,
    from,
    to,
    name,
    phone,
    id,
    type,
  }: FindAllParams): Query {
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
