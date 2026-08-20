import { WeekDay } from 'src/common/enums/weekDays.enum';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Settlement } from '../entities/settlement.entity';
import { ResponsePreviewSettlement } from '../types/response-preview-settlement.type';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';
import { MediumResponseWorkTimeDto } from 'src/work-time/dto/work-time/medium-response-work-time.dto';

export class ResponseSettlementDto {
  readonly id?: string;
  readonly placeCode?: string;
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
  readonly operator:
    | (SmallResponseUserDto & {
        workTime: MediumResponseWorkTimeDto | null;
      })
    | null;
  readonly vouchers: ResponseVoucherDto[] | null;

  constructor(settlement: ResponsePreviewSettlement | Settlement) {
    if (settlement instanceof Settlement) {
      this.id = settlement.id;
      this.placeCode = settlement.placeCode;
      this.createdAt = settlement.createdAt;
      this.updatedAt = settlement.updatedAt;
      this.isClosed = settlement.isClosed;
    }
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
      ...new SmallResponseUserDto(settlement.operator),
      workTime: settlement.operator.workTime
        ? new MediumResponseWorkTimeDto(settlement.operator.workTime)
        : null,
    };
    this.vouchers =
      settlement.vouchers?.length > 0
        ? settlement.vouchers.map(item => new ResponseVoucherDto(item))
        : null;
  }
}
