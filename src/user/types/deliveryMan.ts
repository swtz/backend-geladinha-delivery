import { DeliveryMan } from '../entities/delivery-man.entity';

export type NewDeliveryMan = Omit<DeliveryMan, 'tips'>;
