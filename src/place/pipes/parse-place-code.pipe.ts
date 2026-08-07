import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { formatCnpj, validateCnpj } from 'src/common/utils/format-cnpj';
import { formatCpf, validateCpf } from 'src/common/utils/format-cpf';

@Injectable()
export class ParsePlaceCodePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (
      !(typeof value === 'string') ||
      !value ||
      !this.paramTypes.includes(type)
    ) {
      return undefined;
    }

    if (validateCpf(formatCpf(value))) {
      return formatCpf(value);
    } else if (validateCnpj(formatCnpj(value))) {
      return formatCnpj(value);
    } else if (isUUID(value, '4')) {
      return value;
    }

    throw new BadRequestException('Estabelecimento inválido');
  }
}
