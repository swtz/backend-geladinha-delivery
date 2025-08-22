import { Voucher } from '../entities/voucher.entity';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description?: string | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deliveryMan: {
    id: string;
    name: string;
    phone: string;
    motorcycle: string;
  };

  constructor(voucher: Voucher) {
    this.id = voucher.id;
    this.amount = voucher.amount;
    this.description = voucher.description;
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
    this.deliveryMan = {
      id: voucher.deliveryMan.id,
      name: voucher.deliveryMan.name,
      phone: voucher.deliveryMan.phone,
      motorcycle: voucher.deliveryMan.motorcycle,
    };
  }
}
