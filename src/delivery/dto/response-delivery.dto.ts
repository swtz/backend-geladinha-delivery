import { Delivery } from '../entities/delivery.entity';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Tip } from 'src/tip/entities/tip.entity';
import { SmallResponseCustomerType } from 'src/customer/types/customer.type';
import { SmallResponseMotorcycleDto } from 'src/user/dtos/motorcycle/small-response-motorcycle.dto';
import { MediumResponseWorkTimeDto } from 'src/work-time/dto/work-time/medium-response-work-time.dto';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';

export class ResponseDeliveryDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly description: string | null;
  readonly totalPurchase: number;
  readonly deliveryTax: number;
  readonly paymentMethod: string | null;
  readonly isPaid: boolean;
  readonly motorcycleLicensePlate: string;
  readonly placeCode: string;
  readonly tip: Pick<Tip, 'id' | 'amount'> | null;
  readonly operator: SmallResponseUserDto | null;
  readonly motoboy:
    | (SmallResponseUserDto & {
        workTime: MediumResponseWorkTimeDto | null;
        motorcycle: SmallResponseMotorcycleDto | null;
      })
    | null;
  readonly customer: SmallResponseCustomerType | null;
  readonly address: ResponseAddressDto | null;

  constructor(delivery: Delivery) {
    this.id = delivery.id;
    this.description = delivery.description;
    this.totalPurchase = delivery.totalPurchase;
    this.deliveryTax = delivery.deliveryTax;
    this.paymentMethod = delivery?.paymentMethod.name;
    this.isPaid = delivery.isPaid;
    this.createdAt = delivery.createdAt;
    this.updatedAt = delivery.updatedAt;
    this.motorcycleLicensePlate = delivery.motorcycleLicensePlate;
    this.placeCode = delivery.placeCode;
    this.tip = delivery.tip
      ? {
          id: delivery.tip.id,
          amount: delivery.tip.amount,
        }
      : null;
    this.operator = delivery.operator
      ? new SmallResponseUserDto(delivery.operator)
      : null;
    this.motoboy = delivery.motoboy
      ? {
          ...new SmallResponseUserDto(delivery.motoboy.user),
          workTime: delivery.motoboy.user.workTime
            ? new MediumResponseWorkTimeDto(delivery.motoboy.user.workTime)
            : null,
          motorcycle: delivery.motoboy.motorcycle
            ? new SmallResponseMotorcycleDto(delivery.motoboy.motorcycle)
            : null,
        }
      : null;
    this.customer = delivery.customer
      ? {
          id: delivery.customer.id,
          name: delivery.customer.name,
          lastName: delivery.customer.lastName,
          nickname: delivery.customer.nickname,
          phone: delivery.customer.phone,
        }
      : null;
    this.address = delivery.address
      ? new ResponseAddressDto(delivery.address)
      : null;
  }
}
