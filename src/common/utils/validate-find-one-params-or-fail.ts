import { BadRequestException } from '@nestjs/common';

export function validateFindOneParamsOrFail<T extends Record<string, unknown>>(
  dto: Partial<T>,
  idFromDto?: boolean,
): Partial<T> {
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
