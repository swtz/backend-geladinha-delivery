import { BadRequestException } from '@nestjs/common';

export function validateFindOneParamsOrFail<T extends Record<string, unknown>>(
  dto: Partial<T>,
  forUpdate?: boolean,
): Partial<T> {
  const hasId = Object.hasOwn(dto, 'id');
  const hasValidId = !!dto['id'];
  const hasDefinedParam = Object.values(dto).some(value => {
    return value != null;
  });
  const error = new BadRequestException('Informe os dados para consulta');

  if (forUpdate) {
    if (!hasId || !hasValidId) {
      throw error;
    }

    return dto;
  }

  if (!hasDefinedParam) {
    throw error;
  }

  return dto;
}
