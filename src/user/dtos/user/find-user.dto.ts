import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class FindUserDto extends PartialType(
  PickType(CreateUserDto, [
    'nickname',
    'name',
    'lastName',
    'email',
    'phone',
    'secondPhone',
  ]),
) {
  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  id?: string;
}
