import { UserResponseDtoType } from 'src/user/types/user/user.type';
import { Voucher } from '../entities/voucher.entity';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: UserResponseDtoType;
  readonly createdBy: UserResponseDtoType | null;

  constructor(voucher: Voucher) {
    this.id = voucher.id;
    this.amount = voucher.amount;
    this.description = voucher.description;
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
    this.user = {
      id: voucher.user.id,
      name: voucher.user.name,
      lastName: voucher.user.lastName,
      nickname: voucher.user.nickname,
      phone: voucher.user.phone,
    };
    this.createdBy = voucher.createdBy
      ? {
          id: voucher.createdBy.id,
          name: voucher.createdBy.name,
          lastName: voucher.createdBy.lastName,
          nickname: voucher.createdBy.nickname,
          phone: voucher.createdBy.phone,
        }
      : null;
  }
}
