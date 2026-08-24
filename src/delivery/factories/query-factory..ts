import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, FindOperator, FindOptionsWhere } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethod as PaymentMethodEnum } from '../enums/payment-methods.enum';
import { Role } from 'src/common/role/roles.enum';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';

interface Query {
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class DeliveryFindAllQuery implements Query {
  customer?: FindOptionsWhere<Customer>;
  motoboy?: FindOptionsWhere<DeliveryMan>;
  operator?: FindOptionsWhere<User>;
  paymentMethod?: Partial<PaymentMethod>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
  placeCode?: string;
  motorcycleLicensePlate?: string;
}

class DeliveryTaxQuery implements Query {
  motoboy?: FindOptionsWhere<DeliveryMan>;
  isPaid?: boolean;
  createdAt?: FindOperator<Date>;
}

class TotalPurchaseQuery implements Query {
  operator?: FindOptionsWhere<User>;
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
  userData?: FindOptionsWhere<User>;
  isPaid?: boolean;
  paymentMethod?: PaymentMethodEnum;
  placeCode?: string;
  motorcycleLicensePlate?: string;
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
    userData,
    isPaid,
    paymentMethod,
    placeCode,
    motorcycleLicensePlate: motorcycleLicensePlate,
    from,
    to,
  }: FindAllParams): Query {
    const queryObject = new DeliveryFindAllQuery();
    const data = !userData ? undefined : userData;

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.isPaid = isPaid;
    queryObject.paymentMethod = { name: paymentMethod };
    queryObject.placeCode = placeCode;
    queryObject.motorcycleLicensePlate = motorcycleLicensePlate
      ? motorcycleLicensePlate.toUpperCase()
      : undefined;

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

    queryObject.placeCode = undefined;
    return queryObject;
  }
}

export class DeliveryTaxFactory extends AbstractFactory {
  factoryMethod({ userData, from, to, isPaid }: FindAllParams): Query {
    const queryObject = new DeliveryTaxQuery();

    queryObject.createdAt = this.getDatePeriod(from, to);
    queryObject.motoboy = userData ? { user: userData } : undefined;
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
