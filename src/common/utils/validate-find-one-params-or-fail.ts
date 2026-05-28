import { BadRequestException } from '@nestjs/common';

export function validateFindOneParamsOrFail<T extends Record<string, unknown>>(
  dto: Partial<T>,
): Partial<T> {
  const hasId = Object.hasOwn(dto, 'id');
  const hasValidId = !!dto['id'];
  const hasDefinedParam = Object.values(dto).some(value => {
    return value != null;
  });

  if (hasDefinedParam) {
    return dto;
  }

  if (!hasId || !hasValidId) {
    throw new BadRequestException('Informe os dados para consulta');
  }

  return dto;
}
