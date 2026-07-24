import { User } from 'src/user/entities/user.entity';
import { WorkTime } from '../entities/work-time.entity';

export type FindAllParams = Omit<Partial<WorkTime>, 'user'> & {
  user: Partial<User>;
};
