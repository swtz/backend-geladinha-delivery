import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';

export function getTimeFromDateIsoString(date: string) {
  if (!isISO8601(date, { strict: true })) {
    throw new BadRequestException('Data inválida');
  }
  return date.slice(11, 19);
}
