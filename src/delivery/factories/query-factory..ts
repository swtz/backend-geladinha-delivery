import { Customer } from 'src/customer/entities/customer.entity';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';

interface Query {
  createdAt?: FindOperator<Date>;
}

class DeliveryFindAllQuery implements Query {
  customer?: Partial<Customer>;
  motoboy?: Partial<DeliveryMan>;
  operator?: Partial<User>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class DeliveryTaxQuery implements Query {
  motoboy?: Partial<User>;
  createdAt?: FindOperator<Date> | undefined;
}

type DateParams = {
  fromDate?: Date;
  toDate?: Date;
};

export type FindAllParams = {
  customerName?: string;
  motoboyName?: string;
  operatorName?: string;
  isPaid?: boolean;
} & DateParams;

export type SumDeliveryTaxParams = {
  user?: User;
} & DateParams;

abstract class AbstractFactory {
  checkDateValue(fromDate?: Date, toDate?: Date) {
    if (fromDate !== undefined && toDate !== undefined) {
      return Between(fromDate, toDate);
    }
  }

  abstract factoryMethod(params: FindAllParams | SumDeliveryTaxParams): Query;
}

export class DeliveryFindAllFactory extends AbstractFactory {
  factoryMethod({
    customerName,
    motoboyName,
    operatorName,
    isPaid,
    fromDate,
    toDate,
  }: FindAllParams): Query {
    const queryObject = new DeliveryFindAllQuery();

    queryObject.createdAt = this.checkDateValue(fromDate, toDate);
    queryObject.customer = { name: customerName };
    queryObject.motoboy = { name: motoboyName };
    queryObject.operator = { name: operatorName };
    queryObject.isPaid = isPaid;

    return queryObject;
  }
}

export class DeliveryTaxFactory extends AbstractFactory {
  factoryMethod({ user, fromDate, toDate }: SumDeliveryTaxParams): Query {
    const queryObject = new DeliveryTaxQuery();

    queryObject.createdAt = this.checkDateValue(fromDate, toDate);
    queryObject.motoboy = { id: user?.id };

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
