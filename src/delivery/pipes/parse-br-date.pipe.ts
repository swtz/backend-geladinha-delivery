import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import { fromZonedTime } from 'date-fns-tz';

@Injectable()
export class ParseTimezoneDatePipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      return undefined;
    }

    if (!isISO8601(value, { strict: true })) {
      throw new BadRequestException('Data inválida');
    }

    return fromZonedTime(value, 'America/Sao_Paulo');
  }
}
