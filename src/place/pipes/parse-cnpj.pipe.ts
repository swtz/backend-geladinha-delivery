import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { formatCnpj, validateCnpj } from 'src/common/utils/format-cnpj';

export class ParseCnpjPipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }
    const cnpj = formatCnpj(value);
    if (!validateCnpj(cnpj)) {
      throw new BadRequestException('CNPJ inválido');
    }

    return cnpj;
  }
}
