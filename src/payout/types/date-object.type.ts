import { UTCDate } from '@date-fns/utc';

export type DateObject = {
  initDate: Date | UTCDate;
  endDate: Date | UTCDate;
};
