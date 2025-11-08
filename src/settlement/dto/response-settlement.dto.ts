import { WeekDay } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Settlement } from '../entities/settlement.entity';
import { SmallResponseWorkTime } from 'src/work-time/types/small-response-work-time.type';

export class ResponseSettlementDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly weekDay: WeekDay;
  readonly workDay: Date;
  readonly isClosed?: boolean;
  readonly initValue?: number;
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
  readonly operator:
    | (Pick<User, 'id' | 'name' | 'phone'> & {
        workTime: SmallResponseWorkTime | null;
      })
    | null;
  readonly vouchers: ResponseVoucherDto[] | null;

  constructor(
    settlement: Omit<
      Settlement,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'isClosed'
      | 'description'
      | 'initValue'
    > & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      isClosed?: boolean;
      description?: string;
      initValue?: number;
    },
  ) {
    this.id = settlement.id;
    this.createdAt = settlement.createdAt;
    this.updatedAt = settlement.updatedAt;
    this.isClosed = settlement.isClosed;
    this.initValue = settlement.initValue;
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
    this.operator = settlement.operator
      ? {
          id: settlement.operator.id,
          name: settlement.operator.name,
          phone: settlement.operator.phone,
          workTime: settlement.operator.workTime
            ? {
                id: settlement.operator.workTime.id,
                shift: settlement.operator.workTime.shift,
                initHour: settlement.operator.workTime.initHour,
                endHour: settlement.operator.workTime.endHour,
              }
            : null,
        }
      : null;
    this.vouchers = settlement.vouchers
      ? settlement.vouchers.map(item => new ResponseVoucherDto(item))
      : null;
  }
}
