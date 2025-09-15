import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Payout } from '../entities/payout.entity';

export class ResponsePayoutDto {
  readonly totalDeliveries: number;
  readonly motoboyDaily: number;
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

  constructor(payout: Omit<Payout, 'id' | 'createdAt' | 'updatedAt'>) {
    this.totalDeliveries = payout.totalDeliveries;
    this.motoboyDaily = payout.motoboyDaily;
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
