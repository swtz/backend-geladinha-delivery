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
      const partialValue = value.trim().split(' ');

      if (partialValue.length === 1) {
        parsedValue = partialValue.join('');
      } else {
        parsedValue = value.trim();
      }

      if (parsedValue.length < minLength) {
        throw new BadRequestException('O campo não pode conter apenas espaços');
      } else {
        dto[field] = parsedValue;
      }
    }
  }
}
