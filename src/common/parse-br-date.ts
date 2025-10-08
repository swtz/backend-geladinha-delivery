import { BadRequestException } from '@nestjs/common';
import { parse } from 'date-fns';

export function parseBrDate(date: string, hour: number) {
  const newDate = parse(`${date} ${hour}`, 'dd/MM/yyyy H', new Date());
  const isInvalidYear = newDate.getFullYear().toString(10).length < 4;

  if (!newDate.valueOf() || isInvalidYear) {
    throw new BadRequestException('Data inválida');
  }

  return newDate;
}
