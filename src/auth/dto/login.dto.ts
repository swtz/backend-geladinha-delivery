import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo apelido não pode estar vazio' })
  nickname!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  password!: string;
}
