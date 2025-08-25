import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/role/roles.enum';

export class CreateUserDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsEnum(Role, { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo função não pode estar vazio' })
  role: Role;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  motorcycle?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Valor da diária precisa ser um número' })
  daily?: number;
}
