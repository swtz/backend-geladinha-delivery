import { Voucher } from '../entities/voucher.entity';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description?: string | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: {
    id: string;
    name: string;
    phone: string;
  };

  constructor(voucher: Voucher) {
    this.id = voucher.id;
    this.amount = voucher.amount;
    this.description = voucher.description;
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
    this.user = {
      id: voucher.users.id,
      name: voucher.users.name,
      phone: voucher.users.phone,
    };
  }
}
