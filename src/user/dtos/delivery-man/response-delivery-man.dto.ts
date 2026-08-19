import { Tip } from 'src/tip/entities/tip.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { SmallResponseMotorcycle } from 'src/user/types/motorcycle.type';
import { SmallResponseUserDto } from '../user/small-response-user.dto';
import { SmallResponseMotorcycleDto } from '../motorcycle/small-response-motorcycle.dto';

export class ResponseDeliveryManDto {
  readonly id: string;
  readonly daily: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tips: Omit<Tip, 'motoboy'>[] | null;
  readonly user: SmallResponseUserDto;
  readonly motorcycle: SmallResponseMotorcycle | null;

  constructor(deliveryMan: DeliveryMan) {
    this.id = deliveryMan.id;
    this.daily = deliveryMan.daily;
    this.createdAt = deliveryMan.createdAt;
    this.updatedAt = deliveryMan.updatedAt;
    this.user = new SmallResponseUserDto(deliveryMan.user);
    this.motorcycle = deliveryMan.motorcycle
      ? new SmallResponseMotorcycleDto(deliveryMan.motorcycle)
      : null;
    this.tips =
      deliveryMan.tips && deliveryMan.tips.length > 0
        ? deliveryMan.tips.map(tip => {
            return {
              id: tip.id,
              amount: tip.amount,
              createdAt: tip.createdAt,
              updatedAt: tip.updatedAt,
            };
          })
        : null;
  }
}
