import { BadRequestException } from '@nestjs/common';

export const generateBadRequestException = (msg: string) => {
  return new BadRequestException(msg);
};
