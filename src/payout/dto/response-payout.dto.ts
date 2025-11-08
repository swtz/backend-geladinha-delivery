import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Payout } from '../entities/payout.entity';
import { DeliveryMan } from 'src/user/entities/user.entity';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';

export class ResponsePayoutDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly weekDay: WeekDay;
  readonly workDay: Date;
  readonly isClosed?: boolean;
  readonly totalDeliveries: number;
  readonly motoboyDaily: number;
  readonly motoboyTips: number;
  readonly subtotal: number;
  readonly totalSpending: number;
  readonly total: number;
  readonly motoboy:
    | (Pick<DeliveryMan, 'id' | 'name' | 'phone' | 'motorcycle'> & {
        workTime: MediumResponseWorkTime | null;
      })
    | null;
  readonly vouchers: ResponseVoucherDto[] | null;

  constructor(
    payout: Omit<Payout, 'id' | 'createdAt' | 'updatedAt' | 'isClosed'> & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      isClosed?: boolean;
    },
  ) {
    this.id = payout.id;
    this.createdAt = payout.createdAt;
    this.updatedAt = payout.updatedAt;
    this.weekDay = payout.weekDay;
    this.workDay = payout.workDay;
    this.totalDeliveries = payout.totalDeliveries;
    this.motoboyDaily = payout.motoboyDaily;
    this.motoboyTips = payout.motoboyTips;
    this.subtotal = payout.subtotal;
    this.totalSpending = payout.totalSpending;
    this.total = payout.total;
    this.isClosed = payout.isClosed;
    this.motoboy = payout.motoboy
      ? {
          id: payout.motoboy.id,
          name: payout.motoboy.name,
          phone: payout.motoboy.phone,
          motorcycle: payout.motoboy.motorcycle,
          workTime: payout.motoboy.workTime
            ? {
                id: payout.motoboy.workTime.id,
                shift: payout.motoboy.workTime.shift,
                createdAt: payout.motoboy.workTime.createdAt,
                updatedAt: payout.motoboy.workTime.updatedAt,
                initHour: payout.motoboy.workTime.initHour,
                endHour: payout.motoboy.workTime.endHour,
              }
            : null,
        }
      : null;
    this.vouchers = payout.vouchers
      ? payout.vouchers.map(voucher => new ResponseVoucherDto(voucher))
      : null;
  }
}
