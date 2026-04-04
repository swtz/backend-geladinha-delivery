import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMotorcycleDto {
  @IsNotEmpty({ message: 'Campo placa não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  licensePlate!: string;

  @IsNotEmpty({ message: 'Campo marca não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  brand!: string;

  @IsNotEmpty({ message: 'Campo ano não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
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
