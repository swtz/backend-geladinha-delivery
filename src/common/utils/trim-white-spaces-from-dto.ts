import { BadRequestException } from '@nestjs/common';

export function trimWhiteSpacesFromDto(
  dto: Record<string, any>,
  minLength: number,
  ...excludedFields: string[]
) {
  for (const field in dto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = dto[field];
    let parsedValue = '';

    if (typeof value === 'string' && !excludedFields.includes(field)) {
      parsedValue = value.trim().split(' ').join('');

      if (parsedValue.length < minLength) {
        throw new BadRequestException('O campo não pode conter apenas espaços');
      } else {
        dto[field] = parsedValue;
      }
    }
  }
}
