import { Role } from 'src/common/role/roles.enum';
import { DeliveryMan, User } from '../entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';

export class ResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly motorcycle?: string;
  readonly tip?: number | null;
  readonly daily?: number;
  readonly vouchers: ResponseVoucherDto[] | null;
  readonly roles: Role[];

  constructor(user: User | DeliveryMan) {
    if (user instanceof DeliveryMan) {
      this.motorcycle = user.motorcycle;
      this.tip = user.tip;
      this.daily = user.daily;
    }

    this.id = user.id;
    this.name = user.name;
    this.phone = user.phone;
    this.email = user.email;
    this.vouchers =
      user.vouchers !== null
        ? user.vouchers.map(voucher => {
            return new ResponseVoucherDto(voucher);
          })
        : null;
    this.roles = user.roles.map(role => role.name);
  }
}
