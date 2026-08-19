import { User } from 'src/user/entities/user.entity';
import { FindOptionsRelations } from 'typeorm';

export const essencial: FindOptionsRelations<User> = {
  roles: true,
  workTime: true,
  intervalTime: true,
};

export const full: FindOptionsRelations<User> = {
  ...essencial,
  vouchers: { user: true, createdBy: true },
};
