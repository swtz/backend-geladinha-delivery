import { WeekDay } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';

export type ResponsePreviewSettlement = {
  weekDay: WeekDay;
  workDay: Date;
  initValue: number | undefined;
  quantityDeliveries: number;
  totalRemainingMotoboy: number;
  subtotal: number;
  moneySubtotal: number;
  cardSubtotal: number;
  pixSubtotal: number;
  currentTotal: number;
  expectedTotal: number;
  description: string | undefined;
  operator: User;
  vouchers: Voucher[];
};
