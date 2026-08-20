import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Payout } from '../entities/payout.entity';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';
import { SmallResponseMotorcycle } from 'src/user/types/motorcycle.type';
import { ResponsePreviewPayout } from '../types/response-preview-payout.type';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';
import { SmallResponseMotorcycleDto } from 'src/user/dtos/motorcycle/small-response-motorcycle.dto';
import { MediumResponseWorkTimeDto } from 'src/work-time/dto/work-time/medium-response-work-time.dto';

export class ResponsePayoutDto {
  readonly id?: string;
  readonly placeCode?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly weekDay: WeekDay;
  readonly workDay: Date;
  readonly isClosed?: boolean;
  readonly totalDeliveries: number;
  readonly quantityDeliveries: number;
  readonly motoboyDaily: number;
  readonly motoboyTips: number;
  readonly subtotal: number;
  readonly totalSpending: number;
  readonly total: number;
  readonly motoboy: SmallResponseUserDto & {
    workTime: MediumResponseWorkTime | null;
    motorcycle: SmallResponseMotorcycle | null;
  };
  readonly vouchers?: ResponseVoucherDto[];

  constructor(payout: ResponsePreviewPayout | Payout) {
    if (payout instanceof Payout) {
      this.id = payout.id;
      this.placeCode = payout.placeCode;
      this.createdAt = payout.createdAt;
      this.updatedAt = payout.updatedAt;
      this.isClosed = payout.isClosed;
    }
    this.weekDay = payout.weekDay;
    this.workDay = payout.workDay;
    this.totalDeliveries = payout.totalDeliveries;
    this.quantityDeliveries = payout.quantityDeliveries;
    this.motoboyDaily = payout.motoboyDaily;
    this.motoboyTips = payout.motoboyTips;
    this.subtotal = payout.subtotal;
    this.totalSpending = payout.totalSpending;
    this.total = payout.total;
    this.motoboy = {
      ...new SmallResponseUserDto(payout.motoboy.user),
      motorcycle: payout.motoboy.motorcycle
        ? new SmallResponseMotorcycleDto(payout.motoboy.motorcycle)
        : null,
      workTime: payout.motoboy.user.workTime
        ? new MediumResponseWorkTimeDto(payout.motoboy.user.workTime)
        : null,
    };
    this.vouchers = payout.vouchers
      ? payout.vouchers.map(voucher => new ResponseVoucherDto(voucher))
      : undefined;
  }
}
