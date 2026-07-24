import { User } from 'src/user/entities/user.entity';
import { IntervalTime } from 'src/work-time/entities/interval-time.entity';
import { WorkTime } from 'src/work-time/entities/work-time.entity';

export type FindAllParams = Omit<Partial<IntervalTime>, 'user' | 'workTime'> & {
  user: Partial<User>;
  workTime: Partial<WorkTime>;
};
