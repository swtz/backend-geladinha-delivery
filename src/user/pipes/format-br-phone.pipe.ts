import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { formatPhone } from 'src/common/utils/format-phone';

@Injectable()
export class FormatBrPhonePipe implements PipeTransform {
  private readonly paramTypes = ['body'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    return formatPhone(value);
  }
}
