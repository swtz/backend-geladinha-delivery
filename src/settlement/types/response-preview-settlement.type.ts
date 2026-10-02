import { WeekDay } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';

export type ResponsePreviewSettlement = {
  weekDay: WeekDay;
  workDay: Date;
  initValue: number;
  quantityDeliveries: number;
  totalRemainingMotoboy: number;
  subtotal: number;
  moneySubtotal: number;
  cardSubtotal: number;
  pixSubtotal: number;
  currentTotal: number;
  expectedTotal: number;
  description: string | undefined | null;
  operator: User;
};
