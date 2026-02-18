import { Role } from 'src/common/role/roles.enum';
import { DeliveryMan, User } from '../../entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { Tip } from 'src/tip/entities/tip.entity';
import { SmallResponseWorkTime } from 'src/work-time/types/small-response-work-time.type';

export class ResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly lastName: string;
  readonly nickname: string;
  readonly phone: string;
  readonly secondPhone?: string;
  readonly email: string;
  readonly motorcycle?: string;
  readonly daily?: number;
  readonly tips?: Omit<Tip, 'motoboy'>[] | null;
  readonly vouchers: ResponseVoucherDto[] | null;
  readonly roles: Role[];
  readonly workTime: SmallResponseWorkTime | null;

  constructor(user: User | DeliveryMan) {
    if (user instanceof DeliveryMan) {
      this.motorcycle = user.motorcycle;
      this.daily = user.daily;
      this.tips = user.tips
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
    this.lastName = user.lastName;
    this.nickname = user.nickname;
    this.phone = user.phone;
    this.secondPhone = user.secondPhone;
    this.email = user.email;
    this.vouchers = user.vouchers
      ? user.vouchers.map(voucher => {
          return new ResponseVoucherDto(voucher);
        })
      : null;
    this.roles = user.roles.map(role => role.name);
    this.workTime = user.workTime
      ? {
          id: user.workTime.id,
          shift: user.workTime.shift,
          initHour: user.workTime.initHour,
          endHour: user.workTime.endHour,
        }
      : null;
  }
}
