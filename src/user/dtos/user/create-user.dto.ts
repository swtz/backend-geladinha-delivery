import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/role/roles.enum';

export class CreateUserDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  @MaxLength(130, {
    message: 'O nome só pode ter no máximo 130 caracteres.',
  })
  @MinLength(3, { message: 'O nome precisa ter no mínimo 3 caracteres' })
  name!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo sobrenome não pode estar vazio' })
  @MaxLength(130, {
    message: 'O sobrenome só pode ter no máximo 130 caracteres.',
  })
  @MinLength(3, { message: 'O sobrenome precisa ter no mínimo 3 caracteres' })
  lastName!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo apelido não pode estar vazio' })
  @MaxLength(130, {
    message: 'O apelido só pode ter no máximo 130 caracteres.',
  })
  @MinLength(3, { message: 'O apelido precisa ter no mínimo 3 caracteres' })
  nickname!: string;

  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  secondPhone: string | undefined;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string | undefined;

  @IsEnum(Role, { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo função não pode estar vazio' })
  role!: Role;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres' })
  password!: string;
}
