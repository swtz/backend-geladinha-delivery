import { DeliveryMan } from '../entities/delivery-man.entity';

export type DeliveryManType = Omit<
  DeliveryMan,
  'id' | 'tips' | 'createdAt' | 'updatedAt'
>;
