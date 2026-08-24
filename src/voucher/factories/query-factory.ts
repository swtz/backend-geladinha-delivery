import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator, FindOptionsWhere } from 'typeorm';
import { Voucher } from '../enums/voucher.enum';
import { Settlement } from 'src/settlement/entities/settlement.entity';
import { Payout } from 'src/payout/entities/payout.entity';

export interface Query {
  createdAt?: FindOperator<Date>;
}

export class VoucherFindAllQuery implements Query {
  user?: FindOptionsWhere<User>;
  createdBy?: FindOptionsWhere<User>;
  createdAt?: FindOperator<Date>;
  settlement?: FindOptionsWhere<Settlement>;
  payout?: FindOptionsWhere<Payout>;
}

type DateParams = {
  from?: Date;
  to?: Date;
};

export type FindAllParams = {
  type?: Voucher;
  userData?: FindOptionsWhere<User>;
  settlementData?: FindOptionsWhere<Settlement>;
  payoutData?: FindOptionsWhere<Payout>;
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
    settlementData,
    payoutData,
    from,
    to,
    type,
  }: FindAllParams): VoucherFindAllQuery {
    const queryObject = new VoucherFindAllQuery();
    const data = !userData ? undefined : userData;

    queryObject.createdAt = this.getDatePeriod(from, to);

    if (!type || type === Voucher.DeliveryMan || type === Voucher.User) {
      queryObject.user = data;
      return queryObject;
    }
    if (type === Voucher.Settlement) {
      queryObject.settlement = settlementData;
      return queryObject;
    }
    if (type === Voucher.Payout) {
      queryObject.payout = payoutData;
      return queryObject;
    }

    // implementar Voucher.Customer

    queryObject.createdBy = data;
    return queryObject;
  }
}
