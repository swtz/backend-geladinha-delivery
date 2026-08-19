import { Voucher } from '../entities/voucher.entity';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';

export class ResponseVoucherDto {
  readonly id: string;
  readonly amount: number;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: SmallResponseUserDto;
  readonly createdBy: SmallResponseUserDto | null;

  constructor(voucher: Voucher) {
    this.id = voucher.id;
    this.amount = voucher.amount;
    this.description = voucher.description;
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
    this.user = new SmallResponseUserDto(voucher.user);
    this.createdBy = voucher.createdBy
      ? new SmallResponseUserDto(voucher.createdBy)
      : null;
  }
}
