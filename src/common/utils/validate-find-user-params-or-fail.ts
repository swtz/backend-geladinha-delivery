import { BadRequestException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

type FindUserParams = Pick<
  User,
  'nickname' | 'id' | 'name' | 'lastName' | 'email' | 'phone' | 'secondPhone'
>;

export const validateFindUserParamsOrFail = (
  findUserParams: FindUserParams,
) => {
  console.log(findUserParams);
  for (const param of Object.values(findUserParams)) {
    if (param !== undefined) {
      return findUserParams;
    }
  }

  throw new BadRequestException('Informe os dados para consulta');
};
