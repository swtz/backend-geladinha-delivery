import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateMotorcycleDto {
  @IsNotEmpty({ message: 'Campo placa não pode estar vazio' })
  @Matches(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i, {
    message: 'Placa inválida',
  })
  licensePlate!: string;

  @IsNotEmpty({ message: 'Campo marca não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  brand!: string;

  @IsNotEmpty({ message: 'Campo ano não pode estar vazio' })
  @IsNumberString({ no_symbols: true }, { message: 'Número inválido' })
  @Length(4, 4, { message: 'O ano precisa ter 4 dígitos' })
  year!: string;

  @IsNotEmpty({ message: 'Campo modelo não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  model!: string;

  @IsNotEmpty({ message: 'Campo cor não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  color!: string;

  @IsNotEmpty({ message: 'Campo proprietário não pode estar vazio' })
  @IsUUID('4', { message: 'Formato inválido' })
  owner!: string;

  @IsNotEmpty({ message: 'Campo motorista não pode estar vazio' })
  @IsUUID('4', { message: 'Formato inválido' })
  driver!: string;
}
