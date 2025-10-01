import { User } from 'src/user/entities/user.entity';
import { Voucher } from '../entities/voucher.entity';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: Pick<User, 'id' | 'name' | 'phone'>;
  readonly createdBy: Pick<User, 'id' | 'name' | 'phone'> | null;

  constructor(voucher: Voucher) {
    this.id = voucher.id;
    this.amount = voucher.amount;
    this.description = voucher.description;
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
    this.user = {
      id: voucher.user.id,
      name: voucher.user.name,
      phone: voucher.user.phone,
    };
    this.createdBy =
      voucher.createdBy !== null
        ? {
            id: voucher.createdBy.id,
            name: voucher.createdBy.name,
            phone: voucher.createdBy.phone,
          }
        : null;
  }
}
