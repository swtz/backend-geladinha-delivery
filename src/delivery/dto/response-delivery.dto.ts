import { ResponseCustomerDto } from 'src/customer/dto/response-customer.dto';
import { Delivery } from '../entities/delivery.entity';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Tip } from 'src/tip/entities/tip.entity';
import { UserResponseDtoType } from 'src/user/types/user.type';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';
import { SmallResponseMotorcycle } from 'src/user/types/motorcycle.type';

export class ResponseDeliveryDto {
  readonly id: string;
  readonly description?: string;
  readonly totalPurchase: number;
  readonly deliveryTax: number;
  readonly paymentMethod?: string;
  readonly isPaid: boolean;
  readonly motorcycleLicensePlate: string;
  readonly tip?: Pick<Tip, 'id' | 'amount'>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly operator?: UserResponseDtoType;
  readonly motoboy?: UserResponseDtoType & {
    workTime?: MediumResponseWorkTime;
    motorcycle: SmallResponseMotorcycle;
  };
  readonly customer?: Omit<ResponseCustomerDto, 'addresses'>;
  readonly address?: ResponseAddressDto;

  constructor(delivery: Delivery) {
    this.id = delivery.id;
    this.description = delivery.description;
    this.totalPurchase = delivery.totalPurchase;
    this.deliveryTax = delivery.deliveryTax;
    this.paymentMethod = delivery?.paymentMethod.name;
    this.isPaid = delivery.isPaid;
    this.createdAt = delivery.createdAt;
    this.updatedAt = delivery.updatedAt;
    this.motorcycleLicensePlate = delivery.motoboy.motorcycle.licensePlate;
    this.tip = delivery.tip
      ? {
          id: delivery.tip.id,
          amount: delivery.tip.amount,
        }
      : undefined;
    this.operator = delivery.operator
      ? {
          id: delivery.operator.id,
          name: delivery.operator.name,
          phone: delivery.operator.phone,
        }
      : undefined;
    this.motoboy = delivery.motoboy
      ? {
          id: delivery.motoboy.user.id,
          name: delivery.motoboy.user.name,
          phone: delivery.motoboy.user.phone,
          motorcycle: {
            id: delivery.motoboy.motorcycle.id,
            brand: delivery.motoboy.motorcycle.brand,
            color: delivery.motoboy.motorcycle.color,
            licensePlate: delivery.motoboy.motorcycle.licensePlate,
          },
        }
      : undefined;
    this.customer = delivery.customer
      ? {
          id: delivery.customer.id,
          name: delivery.customer.name,
          phone: delivery.customer.phone,
        }
      : undefined;
    this.address = delivery.address
      ? new ResponseAddressDto(delivery.address)
      : undefined;
  }
}
