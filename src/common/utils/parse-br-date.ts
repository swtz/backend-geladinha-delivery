import { BadRequestException } from '@nestjs/common';
import { UTCDate } from '@date-fns/utc';
import { parse } from 'date-fns';

const types = ['string', 'object'];

export function parseBrDate(hour: number, shortDate?: string | Date | UTCDate) {
  const auxDate = new Date();
  auxDate.setHours(hour);

  const utcDate = new UTCDate(
    auxDate.getUTCFullYear(),
    auxDate.getUTCMonth(),
    auxDate.getUTCDate(),
    auxDate.getUTCHours(),
    auxDate.getUTCMinutes(),
    auxDate.getUTCSeconds(),
  );

  if ([21, 22, 23].includes(hour) && typeof shortDate === 'object') {
    shortDate.setDate(shortDate.getDate() + 1);
  }

  const dateString = shortDate
    ? generateDateString(shortDate)
    : utcDate.toLocaleString('BR', { dateStyle: 'short' });

  const newDate = parse(
    `${dateString} ${auxDate.getUTCHours()}`,
    'dd/MM/yyyy H',
    utcDate,
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
