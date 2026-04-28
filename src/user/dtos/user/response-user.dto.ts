import { Role } from 'src/common/role/roles.enum';
import { User } from '../../entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { SmallResponseWorkTime } from 'src/work-time/types/small-response-work-time.type';

export class ResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly lastName: string;
  readonly nickname: string;
  readonly phone: string;
  readonly secondPhone?: string;
  readonly email?: string;
  readonly daily?: number;
  readonly roles: Role[];
  readonly vouchers?: ResponseVoucherDto[];
  readonly workTime?: SmallResponseWorkTime;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.lastName = user.lastName;
    this.nickname = user.nickname;
    this.phone = user.phone;
    this.secondPhone = user.secondPhone;
    this.email = user.email;
    this.vouchers = user.vouchers?.map(voucher => {
      return new ResponseVoucherDto(voucher);
    });
    this.roles = user.roles.map(role => role.name);
    this.workTime = user.workTime
      ? {
          id: user.workTime.id,
          shift: user.workTime.shift,
          initHour: user.workTime.initHour,
          endHour: user.workTime.endHour,
        }
      : undefined;
  }
}
