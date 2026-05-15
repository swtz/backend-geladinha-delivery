import { BadRequestException } from '@nestjs/common';
import { FindUserDto } from 'src/user/dtos/user/find-user.dto';

export const validateFindUserParamsOrFail = (findUserParams: FindUserDto) => {
  for (const value of Object.values(findUserParams)) {
    if (value) {
      return findUserParams;
    }
  }

  throw new BadRequestException('Informe os dados para consulta');
};
