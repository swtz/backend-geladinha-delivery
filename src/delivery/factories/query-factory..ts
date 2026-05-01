import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethod as PaymentMethodEnum } from '../enums/payment-methods.enum';
import { Role } from 'src/common/role/roles.enum';
import { FindDeliveryManByUserDataType } from 'src/user/types/delivery-man.type';

interface Query {
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class DeliveryFindAllQuery implements Query {
  customer?: Partial<Customer>;
  motoboy?: FindDeliveryManByUserDataType;
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

abstract class AbstractFactory {
  getDatePeriod(from?: Date, to?: Date) {
    if (from !== undefined && to !== undefined) {
      return Between(from, to);
    }
  }

  abstract factoryMethod(params: FindAllParams): Query;
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
    const data = userData === undefined ? { name, phone, id } : userData;

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.isPaid = isPaid;
    queryObject.paymentMethod = { name: paymentMethod };

    if (!type) {
      queryObject.operator = data;
      return queryObject;
    }

    if (type === Role.Motoboy) {
      queryObject['motoboy'] = { user: data };
    } else {
      const key = type === Role.Admin ? 'operator' : type;
      queryObject[key] = data;
    }

    return queryObject;
  }
}

export class DeliveryTaxFactory extends AbstractFactory {
  factoryMethod({ userData, from, to, isPaid }: FindAllParams): Query {
    const queryObject = new DeliveryTaxQuery();

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.motoboy = userData;
    queryObject.isPaid = isPaid;

    return queryObject;
  }
}

export class TotalPurchaseFactory extends AbstractFactory {
  factoryMethod({
    userData,
    from,
    to,
    paymentMethod,
    isPaid,
  }: FindAllParams): Query {
    const queryObject = new TotalPurchaseQuery();

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.operator = userData;
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
