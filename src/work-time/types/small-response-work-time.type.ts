import { WorkTime } from '../entities/work-time.entity';

export type SmallResponseWorkTime = Pick<
  WorkTime,
  'id' | 'shift' | 'initHour' | 'endHour'
>;
