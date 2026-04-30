import { Voucher } from '../entities/voucher.entity';
import { UserDtoType } from 'src/user/types/user';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: UserDtoType;
  readonly createdBy?: UserDtoType;

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
    this.createdBy = voucher.createdBy
      ? {
          id: voucher.createdBy.id,
          name: voucher.createdBy.name,
          phone: voucher.createdBy.phone,
        }
      : undefined;
  }
}
