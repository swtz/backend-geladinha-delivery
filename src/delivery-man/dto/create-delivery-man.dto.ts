import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDeliveryManDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  @IsNotEmpty({ message: 'Campo telefone não pode estar vazio' })
  phone: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  @MinLength(6, { message: 'A senha precisa ter pelo menos 6 caracteres' })
  password: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo motocicleta não pode estar vazio' })
  motorcycle: string;

  @IsNumber({}, { message: 'Valor da diária precisa ser um número' })
  @IsNotEmpty({ message: 'Campo diária não pode estar vazio' })
  daily: number;
}
