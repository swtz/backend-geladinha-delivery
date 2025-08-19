import { DeliveryManEntity } from '../entities/delivery-man.entity';

export class ResponseDeliveryManDto {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly motorcycle: string;
  readonly tip: number;
  readonly daily: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly vouchers:
    | {
        id: string;
        amount: number;
        description?: string;
        createdAt: Date;
        updatedAt: Date;
      }[]
    | null;

  constructor(deliveryMan: DeliveryManEntity) {
    this.id = deliveryMan.id;
    this.name = deliveryMan.name;
    this.phone = deliveryMan.phone;
    this.email = deliveryMan.email;
    this.motorcycle = deliveryMan.motorcycle;
    this.tip = deliveryMan.tip;
    this.daily = deliveryMan.daily;
    this.createdAt = deliveryMan.createdAt;
    this.updatedAt = deliveryMan.updatedAt;
    this.vouchers = deliveryMan.vouchers ?? null;
  }
}
