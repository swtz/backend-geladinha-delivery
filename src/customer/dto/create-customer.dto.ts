import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo sobrenome não pode estar vazio' })
  lastName: string | undefined;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo apelido não pode estar vazio' })
  nickname!: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  secondPhone: string | undefined;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo email não pode estar vazio' })
  email: string | undefined;
}
