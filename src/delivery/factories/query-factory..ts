import { Customer } from 'src/customer/entities/customer.entity';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';

interface Query {
  createdAt?: FindOperator<Date>;
}

class DeliveryQuery implements Query {
  customer?: Partial<Customer>;
  motoboy?: Partial<DeliveryMan>;
  operator?: Partial<User>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

export type QueryParams = {
  customerName?: string;
  motoboyName?: string;
  operatorName?: string;
  isPaid?: boolean;
  fromDate?: Date;
  toDate?: Date;
};

abstract class AbstractFactory {
  checkDateValue(fromDate?: Date, toDate?: Date) {
    if (fromDate !== undefined && toDate !== undefined) {
      return Between(fromDate, toDate);
    }
  }

  abstract factoryMethod(params: QueryParams): Query;
}

export class DeliveryQueryFactory extends AbstractFactory {
  factoryMethod({
    customerName,
    motoboyName,
    operatorName,
    isPaid,
    fromDate,
    toDate,
  }: QueryParams): Query {
    const queryObject = new DeliveryQuery();

    queryObject.createdAt = this.checkDateValue(fromDate, toDate);
    queryObject.customer = { name: customerName };
    queryObject.motoboy = { name: motoboyName };
    queryObject.operator = { name: operatorName };
    queryObject.isPaid = isPaid;

    return queryObject;
  }
}

// const customerName = 'Leonardo';
// const motoboyName = 'Laura';
// const operatorName = 'Maria';
// const isPaid = true;
// const fromDate = undefined;
// const toDate = undefined;

// const queryFactory = new DeliveryQueryFactory();
// const myObject = queryFactory.factoryMethod({
//   customerName,
//   motoboyName,
//   operatorName,
//   isPaid,
//   fromDate,
//   toDate,
// });

// console.log(myObject);
