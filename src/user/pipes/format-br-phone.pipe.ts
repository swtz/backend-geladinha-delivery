import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { formatPhone } from 'src/common/utils/format-phone';

@Injectable()
export class ParseBrPhonePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    return formatPhone(value);
  }
}
