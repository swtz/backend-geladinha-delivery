import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Payout } from '../entities/payout.entity';
import { WeekDay } from 'src/common/enums/weekDays.enum';
import { MediumResponseWorkTime } from 'src/work-time/types/medium-response-work-time.type';
import { UserDtoType } from 'src/user/types/user.type';
import { ResponseMotorcycleDto } from 'src/user/dtos/motorcycle/response-motorcycle.dto';

export class ResponsePayoutDto {
  readonly id?: string;
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
  readonly motoboy: UserDtoType & {
    workTime?: MediumResponseWorkTime;
    motorcycle: Pick<
      ResponseMotorcycleDto,
      'id' | 'brand' | 'color' | 'licensePlate'
    >;
  };
  readonly vouchers?: ResponseVoucherDto[];

  constructor(
    payout: Omit<Payout, 'id' | 'createdAt' | 'updatedAt' | 'isClosed'> & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      isClosed?: boolean;
    },
  ) {
    this.createdAt = payout.createdAt;
    this.updatedAt = payout.updatedAt;
    this.isClosed = payout.isClosed;
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
      id: payout.motoboy.user.id,
      name: payout.motoboy.user.name,
      phone: payout.motoboy.user.phone,
      motorcycle: payout.motoboy.motorcycle,
      workTime: payout.motoboy.user?.workTime,
    };
    this.vouchers = payout.vouchers
      ? payout.vouchers.map(voucher => new ResponseVoucherDto(voucher))
      : undefined;
  }
}
