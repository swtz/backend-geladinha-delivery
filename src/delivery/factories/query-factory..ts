import { Customer } from 'src/customer/entities/customer.entity';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethod as PaymentMethodEnum } from '../enums/payment-methods.enum';
import { Role } from 'src/common/role/roles.enum';

interface Query {
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class DeliveryFindAllQuery implements Query {
  customer?: Partial<Customer>;
  motoboy?: Partial<DeliveryMan>;
  operator?: Partial<User>;
  paymentMethod?: Partial<PaymentMethod>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class DeliveryTaxQuery implements Query {
  motoboy?: Partial<User>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class TotalPurchaseQuery implements Query {
  operator?: Partial<User>;
  paymentMethod?: Partial<PaymentMethod>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

type DateParams = {
  from?: Date;
  to?: Date;
};

export type FindAllParams = {
  type?: Role;
  name?: string;
  phone?: string;
  id?: string;
  userData?: Partial<User>;
  isPaid?: boolean;
  paymentMethod?: PaymentMethodEnum;
} & DateParams;

export type SumDeliveryTaxParams = {
  user?: User;
  isPaid?: boolean;
} & DateParams;

export type SumTotalPurchaseParams = {
  paymentMethod?: PaymentMethodEnum;
} & SumDeliveryTaxParams;

abstract class AbstractFactory {
  checkDateValue(from?: Date, to?: Date) {
    if (from !== undefined && to !== undefined) {
      return Between(from, to);
    }
  }

  abstract factoryMethod(params: FindAllParams | SumDeliveryTaxParams): Query;
}

export class DeliveryFindAllFactory extends AbstractFactory {
  factoryMethod({
    type,
    name,
    phone,
    id,
    userData,
    isPaid,
    paymentMethod,
    from,
    to,
  }: FindAllParams): Query {
    const queryObject = new DeliveryFindAllQuery();

    if (type) {
      const key = type === Role.Admin ? 'operator' : type;
      queryObject[key] = { name, phone, id };
    } else if (userData) {
      queryObject.operator = userData;
    } else {
      queryObject.operator = { name, phone, id };
    }

    queryObject.createdAt = this.checkDateValue(from, to);
    queryObject.isPaid = isPaid;
    queryObject.paymentMethod = { name: paymentMethod };

    return queryObject;
  }
}

export class DeliveryTaxFactory extends AbstractFactory {
  factoryMethod({ user, from, to, isPaid }: SumDeliveryTaxParams): Query {
    const queryObject = new DeliveryTaxQuery();

    queryObject.createdAt = this.checkDateValue(from, to);
    queryObject.motoboy = { id: user?.id };
    queryObject.isPaid = isPaid;

    return queryObject;
  }
}

export class TotalPurchaseFactory extends AbstractFactory {
  factoryMethod({
    user,
    from,
    to,
    paymentMethod,
    isPaid,
  }: SumTotalPurchaseParams): Query {
    const queryObject = new TotalPurchaseQuery();

    queryObject.createdAt = this.checkDateValue(from, to);
    queryObject.operator = { id: user?.id };
    queryObject.paymentMethod = { name: paymentMethod };
    queryObject.isPaid = isPaid;

    return queryObject;
  }
}

// const customerName = 'Leonardo';
// const motoboyName = 'Laura';
// const operatorName = 'Maria';
// const isPaid = true;
// const from = undefined;
// const to = undefined;

// const queryFactory = new DeliveryQueryFactory();
// const myObject = queryFactory.factoryMethod({
//   customerName,
//   motoboyName,
//   operatorName,
//   isPaid,
//   from,
//   to,
// });

// console.log(myObject);
