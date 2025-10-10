import { WeekDay } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Settlement } from '../entities/settlement.entity';

export class ResponseSettlementDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly isClosed?: boolean;
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
  readonly operator: Pick<User, 'id' | 'name' | 'phone'> | null;
  readonly vouchers: ResponseVoucherDto[] | null;

  constructor(
    settlement: Omit<
      Settlement,
      'id' | 'createdAt' | 'updatedAt' | 'isClosed'
    > & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      isClosed?: boolean;
    },
  ) {
    this.id = settlement.id;
    this.createdAt = settlement.createdAt;
    this.updatedAt = settlement.updatedAt;
    this.isClosed = settlement.isClosed;
    this.amountDeliveries = settlement.amountDeliveries;
    this.totalRemainingMotoboy = settlement.totalRemainingMotoboy;
    this.moneySubtotal = settlement.moneySubtotal;
    this.cardSubtotal = settlement.cardSubtotal;
    this.pixSubtotal = settlement.pixSubtotal;
    this.subtotal = settlement.subtotal;
    this.description = settlement.description;
    this.totalSpending = settlement.totalSpending;
    this.currentTotal = settlement.currentTotal;
    this.expectedTotal = settlement.expectedTotal;
    this.weekDay = settlement.weekDay;
    this.workDay = settlement.workDay;
    this.operator =
      settlement.operator !== null
        ? {
            id: settlement.operator.id,
            name: settlement.operator.name,
            phone: settlement.operator.phone,
          }
        : null;
    this.vouchers = settlement.vouchers.map(
      item => new ResponseVoucherDto(item),
    );
  }
}
