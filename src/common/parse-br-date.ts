import { BadRequestException } from '@nestjs/common';
import { parse } from 'date-fns';

export function parseBrDate(date: string, hour: string) {
  const newDate = parse(`${date} ${hour}`, 'dd/MM/yyyy HH:mm', new Date());

  if (!newDate.valueOf()) {
    throw new BadRequestException('Data inválida');
  }

  return newDate;
}
