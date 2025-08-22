import { IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from '../roles.enum';

export class CreateRoleDto {
  @IsEnum(Roles, { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo função não pode estar vazio' })
  name: Roles;
}
