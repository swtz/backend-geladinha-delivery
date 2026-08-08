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

  transform(value: string | object, { type }: ArgumentMetadata) {
    const isObject = typeof value === 'object';
    const placeCode = isObject ? (value['placeCode'] as string) : value;
    if (!value || !placeCode || !this.paramTypes.includes(type)) {
      return isObject ? { ...value, placeCode } : placeCode;
    }

    const formattedCpf = formatCpf(placeCode);
    const formattedCnpj = formatCnpj(placeCode);
    if (validateCpf(formattedCpf)) {
      return isObject ? { ...value, placeCode: formattedCpf } : formattedCpf;
    } else if (validateCnpj(formattedCnpj)) {
      return isObject ? { ...value, placeCode: formattedCnpj } : formattedCnpj;
    } else if (isUUID(placeCode, '4')) {
      return isObject ? { ...value, placeCode } : placeCode;
    }
    throw new BadRequestException('Estabelecimento inválido');
  }
}
