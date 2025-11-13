import { parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// Métodos como payout.update() usam essas funções para
// calcular corretamente os períodos.
// É preciso checar o comportamento desses métodos também.
export function generateRelativeDate(
  day: 'yesterday' | 'tomorrow',
  hour: number,
  referenceDate?: Date,
) {
  const userDate = referenceDate ? referenceDate : new Date();
  const timezoneDate = toZonedTime(userDate, 'America/Sao_Paulo');

  timezoneDate.setHours(hour);

  const relativeDay =
    day === 'yesterday'
      ? timezoneDate.getDate() - 1
      : timezoneDate.getDate() + 1;

  timezoneDate.setDate(relativeDay);

  const date = fromZonedTime(timezoneDate, 'America/Sao_Paulo');
  const dateString = date.toLocaleString('BR', { dateStyle: 'short' });

  const parsedUTCDate = parse(
    `${dateString} ${date.getHours()}`,
    'dd/MM/yyyy H',
    new Date(),
  );

  return parsedUTCDate;
}
