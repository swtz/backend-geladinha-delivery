import { PipeTransform } from '@nestjs/common';
import { commonOrderMap } from 'src/common/data/entity-instructions/ordering';
import { User } from 'src/user/entities/user.entity';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';

export type CommonType<T> = {
  [K in keyof FindOptionsOrder<T>]: FindOptionsOrderValue;
};

export class ParseOrderParamsPipe<
  T extends CommonType<T>,
> implements PipeTransform<T> {
  private readonly properties: CommonType<T>;
  private readonly commonProperties: CommonType<User>;

  constructor(properties: CommonType<T>) {
    this.properties = properties;
    this.commonProperties = commonOrderMap;
  }

  transform(value: CommonType<T>) {
    if (
      !value ||
      typeof value['field'] !== 'string' ||
      typeof value['order'] !== 'string'
    ) {
      return commonOrderMap;
    }

    const object: CommonType<T> = {
      ...this.properties,
      ...this.commonProperties,
    };
    const field = value['field'];
    const order = value['order'];
    const fieldKeys = Object.keys(object);
    const isValidField = fieldKeys.includes(field);
    const isValidOrder = ['asc', 'ASC', 'desc', 'DESC'].includes(order);
    if (isValidField && isValidOrder) {
      return { [field]: order };
    }
    return commonOrderMap;
  }
}
