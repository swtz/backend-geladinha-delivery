import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parseBrDate } from 'src/common/parse-br-date';

@Injectable()
export class ParseBrDatePipe implements PipeTransform {
  private readonly hour: string;

  constructor(hour: string) {
    this.hour = hour;
  }

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || type !== 'query') {
      return undefined;
    }

    return parseBrDate(value, this.hour);
  }
}
