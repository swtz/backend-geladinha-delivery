import { WorkTime } from '../entities/work-time.entity';

export type MediumResponseWorkTime = Pick<
  WorkTime,
  'id' | 'createdAt' | 'updatedAt' | 'shift' | 'initHour' | 'endHour'
>;
