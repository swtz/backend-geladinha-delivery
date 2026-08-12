import { Tip } from 'src/tip/entities/tip.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { ResponseMotorcycleDto } from '../motorcycle/response-motorcycle.dto';
import { UserResponseDtoType } from 'src/user/types/user/user.type';

export class ResponseDeliveryManDto {
  readonly id: string;
  readonly daily: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tips: Omit<Tip, 'motoboy'>[] | null;
  readonly user: UserResponseDtoType;
  readonly motorcycle: Pick<
    ResponseMotorcycleDto,
    'id' | 'licensePlate' | 'brand' | 'color' | 'displacement' | 'placeCode'
  > | null;

  constructor(deliveryMan: DeliveryMan) {
    this.id = deliveryMan.id;
    this.daily = deliveryMan.daily;
    this.createdAt = deliveryMan.createdAt;
    this.updatedAt = deliveryMan.updatedAt;
    this.user = {
      id: deliveryMan.user?.id,
      name: deliveryMan.user?.name,
      lastName: deliveryMan.user?.lastName,
      nickname: deliveryMan.user?.nickname,
      phone: deliveryMan.user?.phone,
    };
    this.motorcycle = deliveryMan.motorcycle
      ? {
          id: deliveryMan.motorcycle.id,
          brand: deliveryMan.motorcycle.brand,
          color: deliveryMan.motorcycle.color,
          displacement: deliveryMan.motorcycle.displacement,
          licensePlate: deliveryMan.motorcycle.licensePlate,
          placeCode: deliveryMan.motorcycle.placeCode,
        }
      : null;
    this.tips =
      deliveryMan.tips?.length > 0
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
