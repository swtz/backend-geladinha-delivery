import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres' })
  password: string;
}
