import { Role } from 'src/common/role/roles.enum';
import { User } from '../entities/user.entity';

export class ResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly vouchers:
    | {
        amount: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
          id: string;
          name: string;
          phone: string;
        };
        createdBy: {
          id: string;
          name: string;
          phone: string;
        } | null;
      }[]
    | null;
  readonly roles: Role[];

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.phone = user.phone;
    this.email = user.email;
    this.vouchers = user.vouchers.map(voucher => {
      return {
        amount: voucher.amount,
        description: voucher.description,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
        user: {
          id: voucher.user.id,
          name: voucher.user.name,
          phone: voucher.user.phone,
        },
        createdBy:
          voucher.createdBy !== null
            ? {
                id: voucher.createdBy.id,
                name: voucher.createdBy.name,
                phone: voucher.createdBy.phone,
              }
            : null,
      };
    });
    this.roles = user.roles.map(role => role.name);
  }
}
