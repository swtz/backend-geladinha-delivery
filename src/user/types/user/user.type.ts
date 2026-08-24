import { User } from '../../entities/user.entity';

export type SmallResponseUserType = Pick<
  User,
  'id' | 'name' | 'lastName' | 'nickname' | 'phone'
>;
