import { Address } from 'src/address/entities/address.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Place } from 'src/place/entities/place.entity';
import { Settlement } from 'src/settlement/entities/settlement.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { Motorcycle } from 'src/user/entities/motorcycle.entity';
import { User } from 'src/user/entities/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
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

export const payoutOrderMap = generateOrderingMap<Payout>({
  motoboy: undefined,
  motoboyDaily: undefined,
  motoboyTips: undefined,
  quantityDeliveries: undefined,
  totalDeliveries: undefined,
  total: undefined,
  subtotal: undefined,
  totalSpending: undefined,
  weekDay: undefined,
  workDay: undefined,
  vouchers: undefined,
  placeCode: undefined,
});

export const placeOrderMap = generateOrderingMap<Place>({
  name: undefined,
  businessName: undefined,
  address: undefined,
  code: undefined,
  cnpj: undefined,
  cpf: undefined,
  email: undefined,
  phone: undefined,
  secondPhone: undefined,
  postalBox: undefined,
  owners: undefined,
  workTimes: undefined,
});

export const motorcycleOrderMap = generateOrderingMap<Motorcycle>({
  brand: undefined,
  color: undefined,
  displacement: undefined,
  model: undefined,
  placeCode: undefined,
  year: undefined,
  licensePlate: undefined,
  driver: undefined,
  owner: undefined,
});

export const deliveryOrderMap = generateOrderingMap<Delivery>({
  deliveryTax: undefined,
  description: undefined,
  paymentMethod: undefined,
  placeCode: undefined,
  totalPurchase: undefined,
  tip: undefined,
  isPaid: undefined,
  address: undefined,
  customer: undefined,
  motoboy: undefined,
  motorcycleLicensePlate: undefined,
  operator: undefined,
});

export const userOrderMap = generateOrderingMap<User>({
  name: undefined,
  lastName: undefined,
  email: undefined,
  nickname: undefined,
  placeCode: undefined,
  roles: undefined,
  phone: undefined,
  secondPhone: undefined,
  vouchers: undefined,
  deliveryMan: undefined,
});

export const deliveryManOrderMap = generateOrderingMap<DeliveryMan>({
  user: undefined,
  daily: undefined,
  motorcycle: undefined,
  tips: undefined,
});

export const voucherOrderMap = generateOrderingMap<Voucher>({
  amount: undefined,
  description: undefined,
  user: undefined,
  payout: undefined,
  settlement: undefined,
  createdBy: undefined,
});

// talvez dê pra fazer um método como esse para conseguir gerar um objeto de relações
// com mais precisão
