import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { formatCpf, validateCpf } from 'src/common/utils/format-cpf';

export class ParseCpfPipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }
    const cpf = formatCpf(value);
    if (!validateCpf(cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    return cpf;
  }
}
