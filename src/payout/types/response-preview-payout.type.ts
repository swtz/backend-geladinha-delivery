import { WeekDay } from 'src/common/enums/weekDays.enum';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';

export type ResponsePreviewPayout = {
  weekDay: WeekDay;
  workDay: Date;
  totalDeliveries: number;
  quantityDeliveries: number;
  motoboyDaily: number;
  motoboyTips: number;
  subtotal: number;
  totalSpending: number;
  total: number;
  motoboy: DeliveryMan;
  vouchers: Voucher[];
};
