import { Role } from 'src/common/role/roles.enum';
import { DeliveryMan, User } from '../entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Tip } from 'src/tip/entities/tip.entity';

export class ResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly motorcycle?: string;
  readonly daily?: number;
  readonly tips?: Omit<Tip, 'motoboy'>[] | null;
  readonly vouchers: ResponseVoucherDto[] | null;
  readonly roles: Role[];

  constructor(user: User | DeliveryMan) {
    if (user instanceof DeliveryMan) {
      this.motorcycle = user.motorcycle;
      this.daily = user.daily;
      this.tips =
        user.tips !== null
          ? user.tips.map(tip => {
              return {
                id: tip.id,
                amount: tip.amount,
                createdAt: tip.createdAt,
                updatedAt: tip.updatedAt,
              };
            })
          : null;
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
