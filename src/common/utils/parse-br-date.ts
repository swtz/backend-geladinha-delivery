import { BadRequestException } from '@nestjs/common';
import { parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export function parseBrDate(hour: number, shortDate?: string | Date) {
  // objetivo dessa função:
  // gerar uma instância de Date com base em um 'shortDate'
  // ou com base no horário atual.
  // shortDate é sempre uma data com deslocamento 180? (Data BR)
  // Quando não passo shortDate, o que acontece em termos de algoritmo?

  const utcDate = new Date();
  const userDate = toZonedTime(utcDate, 'America/Sao_Paulo');
  userDate.setHours(hour);

  const date = fromZonedTime(userDate, 'America/Sao_Paulo');
  const dateString = date.toLocaleString('BR', { dateStyle: 'short' });

  const parsedUTCDate = parse(
    `${dateString} ${date.getHours()}`,
    'dd/MM/yyyy H',
    new Date(),
  );
  const isInvalidYear = parsedUTCDate.getFullYear().toString(10).length < 4;

  if (!parsedUTCDate.valueOf() || isInvalidYear) {
    throw new BadRequestException('Data inválida');
  }

  return parsedUTCDate;
}
