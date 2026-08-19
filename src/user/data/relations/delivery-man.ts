import { FindOptionsRelations } from 'typeorm';
import { essencial as userEssencial } from './user';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';

export const essencial: FindOptionsRelations<DeliveryMan> = {
  motorcycle: true,
  user: userEssencial,
};

export const full: FindOptionsRelations<DeliveryMan> = {
  ...essencial,
  tips: true,
};
