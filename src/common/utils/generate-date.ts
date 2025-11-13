import { parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export function generateRelativeDate(
  day: 'yesterday' | 'tomorrow',
  hour: number,
  referenceDate?: Date,
) {
  const utcDate = new Date();
  const userDate = toZonedTime(utcDate, 'America/Sao_Paulo');
  userDate.setHours(hour);

  const relativeDay =
    day === 'yesterday' ? userDate.getDate() - 1 : userDate.getDate() + 1;
  userDate.setDate(relativeDay);

  const date = fromZonedTime(userDate, 'America/Sao_Paulo');
  const dateString = date.toLocaleString('BR', { dateStyle: 'short' });

  const parsedUTCDate = parse(
    `${dateString} ${date.getHours()}`,
    'dd/MM/yyyy H',
    new Date(),
  );

  return parsedUTCDate;
}
