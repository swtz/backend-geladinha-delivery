import { Role } from 'src/common/role/roles.enum';
import { User } from '../../entities/user.entity';
import { ResponseVoucherDto } from 'src/voucher/dto/response-voucher.dto';
import { SmallResponseWorkTime } from 'src/work-time/types/small-response-work-time.type';
import { ResponseIntervalTimeDto } from 'src/work-time/dto/interval-time/response-interval-time.dto';

export class ResponseUserDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly name: string;
  readonly lastName: string;
  readonly nickname: string;
  readonly phone: string;
  readonly secondPhone: string | null;
  readonly email: string | null;
  readonly placeCode: string;
  readonly roles: Role[] | null;
  readonly vouchers: ResponseVoucherDto[] | null;
  readonly workTime: SmallResponseWorkTime | null;
  readonly intervalTime: Omit<ResponseIntervalTimeDto, 'workTime'> | null;

  constructor(user: User) {
    this.id = user.id;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.name = user.name;
    this.lastName = user.lastName;
    this.nickname = user.nickname;
    this.phone = user.phone;
    this.secondPhone = user.secondPhone;
    this.email = user.email;
    this.placeCode = user.placeCode;
    this.roles =
      user.roles?.length > 0 ? user.roles.map(role => role.name) : null;
    this.vouchers = user.vouchers
      ? user.vouchers.map(voucher => {
          return new ResponseVoucherDto(voucher);
        })
      : null;
    this.workTime = user.workTime
      ? {
          id: user.workTime.id,
          shift: user.workTime.shift,
          initHour: user.workTime.initHour,
          endHour: user.workTime.endHour,
          duration: user.workTime.duration,
        }
      : null;
    this.intervalTime = user.intervalTime
      ? {
          id: user.intervalTime.id,
          initHour: user.intervalTime.initHour,
          endHour: user.intervalTime.endHour,
          duration: user.intervalTime.duration,
          createdAt: user.intervalTime.createdAt,
          updatedAt: user.intervalTime.updatedAt,
        }
      : null;
  }
}
