import { WorkTime } from '../entities/work-time.entity';

export type NewWorkTimeForRest = Omit<
  WorkTime,
  'id' | 'createdAt' | 'updatedAt' | 'places' | 'user'
>;
