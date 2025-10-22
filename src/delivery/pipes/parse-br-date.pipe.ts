import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parseBrDate } from 'src/common/utils/parse-br-date';

@Injectable()
export class ParseBrDatePipe implements PipeTransform {
  private readonly hour: number;
  private readonly paramTypes = ['body', 'query'];

  constructor(hour: number) {
    this.hour = hour;
  }

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    const parsedValue = value.split('-').join('/');
    return parseBrDate(parsedValue, this.hour);
  }
}
