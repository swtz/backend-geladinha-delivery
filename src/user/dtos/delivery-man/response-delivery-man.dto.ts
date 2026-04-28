import { Tip } from 'src/tip/entities/tip.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { Motorcycle } from 'src/user/entities/motorcycle.entity';

export class ResponseDeliveryManDto {
  readonly id: string;
  readonly daily: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly motorcycle: Pick<Motorcycle, 'id' | 'model' | 'licensePlate'>;
  readonly tips?: Omit<Tip, 'motoboy'>[];

  constructor(deliveryMan: DeliveryMan) {
    this.id = deliveryMan.id;
    this.daily = deliveryMan.daily;
    this.createdAt = deliveryMan.createdAt;
    this.updatedAt = deliveryMan.updatedAt;
    this.motorcycle = deliveryMan.motorcycle;
    this.tips = deliveryMan.tips?.map(tip => {
      return {
        id: tip.id,
        amount: tip.amount,
        createdAt: tip.createdAt,
        updatedAt: tip.updatedAt,
      };
    });
  }
}
