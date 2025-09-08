import { parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseBrDatePipe implements PipeTransform {
  private readonly hour: string;

  constructor(hour: string) {
    this.hour = hour;
  }

  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) {
      return undefined;
    }

    const date = this.validateDate(value, this.hour);
    const isInvalidYear = date.getFullYear().toString(10).length < 4;

    if (!date.valueOf() || isInvalidYear) {
      throw new BadRequestException('Data inválida');
    }

    return date;
  }

  validateDate(date: string, hour: string) {
    return parse(`${date} ${hour}`, 'dd/MM/yyyy HH:mm', new Date(), {
      locale: ptBR,
    });
  }
}
