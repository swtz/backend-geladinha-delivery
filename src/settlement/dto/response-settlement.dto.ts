import { WeekDay } from 'src/common/enums/weekDays.enum';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Settlement } from '../entities/settlement.entity';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';
import { UserResponseDtoType } from 'src/user/types/user/user.type';

export class ResponseSettlementDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly weekDay: WeekDay;
  readonly workDay: Date;
  readonly isClosed?: boolean;
  readonly initValue?: number;
  readonly quantityDeliveries: number;
  readonly totalRemainingMotoboy: number;
  readonly moneySubtotal: number;
  readonly cardSubtotal: number;
  readonly pixSubtotal: number;
  readonly subtotal: number;
  readonly description?: string;
  readonly currentTotal: number;
  readonly expectedTotal: number;
  readonly operator: UserResponseDtoType & {
    workTime?: MediumResponseWorkTime;
  };
  readonly vouchers?: ResponseVoucherDto[];

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
    this.quantityDeliveries = settlement.quantityDeliveries;
    this.totalRemainingMotoboy = settlement.totalRemainingMotoboy;
    this.moneySubtotal = settlement.moneySubtotal;
    this.cardSubtotal = settlement.cardSubtotal;
    this.pixSubtotal = settlement.pixSubtotal;
    this.subtotal = settlement.subtotal;
    this.description = settlement.description;
    this.currentTotal = settlement.currentTotal;
    this.expectedTotal = settlement.expectedTotal;
    this.weekDay = settlement.weekDay;
    this.workDay = settlement.workDay;
    this.operator = {
      id: settlement.operator.id,
      name: settlement.operator.name,
      phone: settlement.operator.phone,
      workTime: settlement.operator?.workTime,
    };
    this.vouchers = settlement.vouchers
      ? settlement.vouchers.map(item => new ResponseVoucherDto(item))
      : undefined;
  }
}
