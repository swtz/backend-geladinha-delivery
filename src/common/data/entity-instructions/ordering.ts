import { Address } from 'src/address/entities/address.entity';
import { Settlement } from 'src/settlement/entities/settlement.entity';
import { User } from 'src/user/entities/user.entity';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';

export function generateOrderingMap<T>(orderParams: {
  [K in keyof FindOptionsOrder<T>]: FindOptionsOrderValue;
}) {
  return orderParams;
}

export const commonOrderMap = generateOrderingMap<User>({
  id: undefined,
  createdAt: 'DESC',
  updatedAt: undefined,
});

export const addressOrderMap = generateOrderingMap<Address>({
  city: undefined,
  street: undefined,
  neighborhood: undefined,
  number: undefined,
  postalCode: undefined,
  stateCode: undefined,
  customer: undefined,
  isDefault: undefined,
});

export const settlementOrderMap = generateOrderingMap<Settlement>({
  initValue: undefined,
  description: undefined,
  quantityDeliveries: undefined,
  weekDay: undefined,
  workDay: undefined,
  totalRemainingMotoboy: undefined,
  subtotal: undefined,
  pixSubtotal: undefined,
  moneySubtotal: undefined,
  cardSubtotal: undefined,
  currentTotal: undefined,
  expectedTotal: undefined,
  isClosed: undefined,
  placeCode: undefined,
  operator: undefined,
});

// talvez dê pra fazer um método como esse para conseguir gerar um objeto de relações
// com mais precisão
