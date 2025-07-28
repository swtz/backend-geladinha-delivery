import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  password: string;
}
