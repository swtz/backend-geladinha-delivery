import { Delivery } from '../entities/delivery.entity';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Tip } from 'src/tip/entities/tip.entity';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';
import { SmallResponseMotorcycle } from 'src/user/types/motorcycle.type';
import { UserResponseDtoType } from 'src/user/types/user/user.type';
import { SmallResponseCustomer } from 'src/customer/types/customer.type';

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
  readonly tip: Pick<Tip, 'id' | 'amount'> | null;
  readonly operator: UserResponseDtoType | null;
  readonly motoboy:
    | (UserResponseDtoType & {
        workTime: MediumResponseWorkTime | null;
        motorcycle: SmallResponseMotorcycle;
      })
    | null;
  readonly customer: SmallResponseCustomer | null;
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
    this.tip = delivery.tip
      ? {
          id: delivery.tip.id,
          amount: delivery.tip.amount,
        }
      : null;
    this.operator = delivery.operator
      ? {
          id: delivery.operator.id,
          name: delivery.operator.name,
          lastName: delivery.operator.lastName,
          nickname: delivery.operator.nickname,
          phone: delivery.operator.phone,
        }
      : null;
    this.motoboy = delivery.motoboy
      ? {
          id: delivery.motoboy.user.id,
          name: delivery.motoboy.user.name,
          lastName: delivery.motoboy.user.lastName,
          nickname: delivery.motoboy.user.nickname,
          phone: delivery.motoboy.user.phone,
          workTime: delivery.motoboy.user.workTime
            ? {
                id: delivery.motoboy.user.workTime.id,
                createdAt: delivery.motoboy.user.workTime.createdAt,
                updatedAt: delivery.motoboy.user.workTime.updatedAt,
                shift: delivery.motoboy.user.workTime.shift,
                initHour: delivery.motoboy.user.workTime.initHour,
                endHour: delivery.motoboy.user.workTime.endHour,
                duration: delivery.motoboy.user.workTime.duration,
              }
            : null,
          motorcycle: {
            id: delivery.motoboy.motorcycle.id,
            brand: delivery.motoboy.motorcycle.brand,
            color: delivery.motoboy.motorcycle.color,
            licensePlate: delivery.motoboy.motorcycle.licensePlate,
          },
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
