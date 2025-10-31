import { BadRequestException } from '@nestjs/common';
import { parse } from 'date-fns';

export function parseBrDate(date: string | Date, hour: number) {
  const shortDate =
    typeof date === 'object'
      ? date.toLocaleString('BR', {
          dateStyle: 'short',
        })
      : date;

  const newDate = parse(`${shortDate} ${hour}`, 'dd/MM/yyyy H', new Date());
  const isInvalidYear = newDate.getFullYear().toString(10).length < 4;

  if (!newDate.valueOf() || isInvalidYear) {
    throw new BadRequestException('Data inválida');
  }

  return newDate;
}
