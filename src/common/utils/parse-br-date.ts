import { BadRequestException } from '@nestjs/common';
import { UTCDate } from '@date-fns/utc';
import { parse } from 'date-fns';

const types = ['string', 'object'];

export function parseBrDate(hour: number, shortDate?: string | Date | UTCDate) {
  const dateString = shortDate
    ? generateDateString(shortDate)
    : new Date().toLocaleString('BR', { dateStyle: 'short' });

  const newDate = parse(
    `${dateString} ${hour + 3}`,
    'dd/MM/yyyy H',
    new UTCDate(),
  );
  const isInvalidYear = newDate.getFullYear().toString(10).length < 4;

  if (!newDate.valueOf() || isInvalidYear) {
    throw new BadRequestException('Data inválida');
  }

  return newDate;
}

function generateDateString(date: string | Date | UTCDate) {
  if (!types.includes(typeof date)) {
    throw new BadRequestException('Formato da data é inválido');
  }

  if (typeof date === 'string') {
    return date;
  }

  return date.toLocaleString('BR', {
    dateStyle: 'short',
  });
}
