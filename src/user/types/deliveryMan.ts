import { DeliveryMan } from '../entities/delivery-man.entity';

export type NewDeliveryMan = Omit<
  DeliveryMan,
  'id' | 'tips' | 'createdAt' | 'updatedAt'
>;
