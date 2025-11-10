import { UTCDate } from '@date-fns/utc';
import { parse } from 'date-fns';

export function generateRelativeDate(
  day: 'yesterday' | 'tomorrow',
  date: Date | UTCDate,
  hour?: number,
) {
  const utcHour = hour ? hour + 3 : date.getUTCHours();
  const relativeDay =
    day === 'yesterday' ? date.getDate() - 1 : date.getDate() + 1;
  const newDate = parse(
    `${date.toLocaleString('BR', { dateStyle: 'short' })} ${utcHour}`,
    'dd/MM/yyyy H',
    new UTCDate(),
  );
  newDate.setDate(relativeDay);
  return newDate;
}
