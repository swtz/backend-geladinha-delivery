import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral } from 'typeorm';

export function validateFindOneParamsOrFail<T extends ObjectLiteral>(
  dto: FindOptionsWhere<T>,
  idFromDto?: boolean,
): FindOptionsWhere<T> {
  const error = new BadRequestException('Informe os dados para consulta');
  const hasDefinedParam = Object.values(dto).some(value => {
    return value != null;
  });

  if (!idFromDto) {
    if (!hasDefinedParam) {
      throw error;
    }

    return dto;
  }

  const hasId = Object.hasOwn(dto, 'id');
  const hasValidId = !!dto['id'];

  if (!hasId || !hasValidId) {
    throw error;
  }

  return dto;
}
