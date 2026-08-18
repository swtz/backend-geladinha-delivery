import { User } from 'src/user/entities/user.entity';

export class SmallResponseUserDto {
  readonly id: string;
  readonly name: string;
  readonly lastName: string;
  readonly nickname: string;
  readonly phone: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.lastName = user.lastName;
    this.nickname = user.nickname;
    this.phone = user.phone;
  }
}
