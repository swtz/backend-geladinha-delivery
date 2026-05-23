import { User } from '../../entities/user.entity';

export type UserResponseDtoType = Pick<User, 'id' | 'name' | 'phone'>;
