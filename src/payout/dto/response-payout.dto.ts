import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Payout } from '../entities/payout.entity';

export class ResponsePayoutDto {
  readonly id?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly totalDeliveries: number;
  readonly motoboyDaily: number;
  readonly motoboyTips?: number;
  readonly subtotal: number;
  readonly totalSpending: number;
  readonly total: number;
  readonly isClosed: boolean;
  readonly motoboy: {
    id: string;
    name: string;
    phone: string;
    motorcycle: string;
  };
  readonly vouchers: ResponseVoucherDto[];

  constructor(
    payout: Omit<Payout, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      motoboyTips?: number;
    },
  ) {
    this.id = payout.id;
    this.createdAt = payout.createdAt;
    this.updatedAt = payout.updatedAt;
    this.totalDeliveries = payout.totalDeliveries;
    this.motoboyDaily = payout.motoboyDaily;
    this.motoboyTips = payout.motoboyTips;
    this.subtotal = payout.subtotal;
    this.totalSpending = payout.totalSpending;
    this.total = payout.total;
    this.isClosed = payout.isClosed;
    this.motoboy = {
      id: payout.motoboy.id,
      name: payout.motoboy.name,
      phone: payout.motoboy.phone,
      motorcycle: payout.motoboy.motorcycle,
    };
    this.vouchers = payout.vouchers.map(
      voucher => new ResponseVoucherDto(voucher),
    );
  }
}
