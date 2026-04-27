import { essencial as deliveryManEssencial } from '../relations/delivery-man';

export const essencial = { roles: true, workTime: true };

export const withDeliveryMan = {
  ...deliveryManEssencial,
};

export const full = {
  ...essencial,
  ...withDeliveryMan,
  vouchers: { user: true, createdBy: true },
};
