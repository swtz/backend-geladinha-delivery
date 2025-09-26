import { ResponseCustomerDto } from 'src/customer/dto/response-customer.dto';
import { Delivery } from '../entities/delivery.entity';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';

export class ResponseDeliveryDto {
  readonly id: string;
  readonly description?: string | null;
  readonly totalPurchase: number;
  readonly deliveryTax: number;
  readonly paymentMethod: string | null;
  readonly paid: boolean;
  readonly tip: {
    id: string;
    amount: number;
  } | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly operator: {
    id: string;
    name: string;
    phone: string;
  } | null;
  readonly motoboy: {
    id: string;
    name: string;
    phone: string;
    motorcycle: string;
  } | null;
  readonly customer: Omit<ResponseCustomerDto, 'addresses'> | null;
  readonly address: ResponseAddressDto | null;

  constructor(delivery: Delivery) {
    this.id = delivery.id;
    this.description = delivery.description;
    this.totalPurchase = delivery.totalPurchase;
    this.deliveryTax = delivery.deliveryTax;
    this.paymentMethod =
      delivery.paymentMethod !== null ? delivery.paymentMethod.name : null;
    this.paid = delivery.paid;
    this.tip =
      delivery.tip !== null
        ? {
            id: delivery.tip.id,
            amount: delivery.tip.amount,
          }
        : null;
    this.createdAt = delivery.createdAt;
    this.updatedAt = delivery.updatedAt;
    this.operator =
      delivery.operator !== null
        ? {
            id: delivery.operator.id,
            name: delivery.operator.name,
            phone: delivery.operator.phone,
          }
        : null;
    this.motoboy =
      delivery.motoboy !== null
        ? {
            id: delivery.motoboy.id,
            name: delivery.motoboy.name,
            phone: delivery.motoboy.phone,
            motorcycle: delivery.motoboy.motorcycle,
          }
        : null;
    this.customer =
      delivery.customer !== null
        ? {
            id: delivery.customer.id,
            name: delivery.customer.name,
            phone: delivery.customer.phone,
          }
        : null;
    this.address =
      delivery.address !== null
        ? new ResponseAddressDto(delivery.address)
        : null;
  }
}
