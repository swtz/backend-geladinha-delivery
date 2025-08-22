import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Roles } from '../roles.enum';

export class CreateRoleDto {
  @IsEnum(Roles, { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo função não pode estar vazio' })
  name: string;

  @IsUUID('4', { message: 'Formato inválido' })
  user: string;
}
