import { essencial as deliveryManEssencial } from '../relations/delivery-man';

export const essencial = { roles: true, workTime: true };

export const withDeliveryMan = {
  ...essencial,
  deliveryMan: deliveryManEssencial,
};

export const full = {
  ...withDeliveryMan,
  vouchers: { user: true, createdBy: true },
};
