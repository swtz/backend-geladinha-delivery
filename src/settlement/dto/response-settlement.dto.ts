import { WeekDay } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';

export class ResponseSettlementDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly isClosed?: Date;
  readonly amountDeliveries: number;
  readonly totalRemainingMotoboy: number;
  readonly moneySubtotal: number;
  readonly cardSubtotal: number;
  readonly pixSubtotal: number;
  readonly subtotal: number;
  readonly description?: string | null;
  readonly totalSpending: number;
  readonly currentTotal: number;
  readonly expectedTotal: number;
  readonly weekDay: WeekDay;
  readonly workDay: Date;
  readonly operator: Pick<User, 'id' | 'name' | 'phone'>;
  readonly vouchers: ResponseVoucherDto[] | null;
}
