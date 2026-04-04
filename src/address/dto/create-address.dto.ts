import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPostalCode,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo rua não pode estar vazio' })
  @MaxLength(48, { message: 'Campo rua pode ter no máximo 48 caracteres' })
  @MinLength(4, { message: 'Campo rua precisa ter no mínimo 4 caracteres' })
  street!: string;

  @IsOptional()
  @IsNumberString({ no_symbols: true }, { message: 'Número inválido' })
  @IsNotEmpty({ message: 'Campo número não pode estar vazio' })
  @MaxLength(16, { message: 'Campo número pode ter no máximo 16 caracteres' })
  number?: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo complemento não pode estar vazio' })
  @MaxLength(32, {
    message: 'Campo complemento pode ter no máximo 32 caracteres',
  })
  @MinLength(8, {
    message: 'Campo complemento precisa ter no mínimo 8 caracteres',
  })
  complement?: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo ponto de referência não pode estar vazio' })
  @MaxLength(32, {
    message: 'Campo ponto de referência pode ter no máximo 32 caracteres',
  })
  @MinLength(8, {
    message: 'Campo ponto de referência precisa ter no mínimo 8 caracteres',
  })
  referencePoint?: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo bairro não pode estar vazio' })
  @MaxLength(32, { message: 'Campo bairro pode ter no máximo 32 caracteres' })
  @MinLength(4, { message: 'Campo bairro precisa ter no mínimo 4 caracteres' })
  neighborhood!: string;

  @IsOptional()
  @IsPostalCode('BR', { message: 'CEP inválido' })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo cidade não pode estar vazio' })
  @MaxLength(32, { message: 'Campo cidade pode ter no máximo 32 caracteres' })
  @MinLength(4, { message: 'Campo cidade precisa ter no mínimo 4 caracteres' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo UF não pode estar vazio' })
  @Length(2, 2, { message: 'Campo UF precisa ter 2 caracteres' })
  stateCode?: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo localização não pode estar vazio' })
  @MaxLength(32, {
    message: 'Campo localização pode ter no máximo 32 caracteres',
  })
  location?: string;

  @IsOptional()
  @IsBoolean({ message: 'Campo endereço padrão só pode ser verdadeiro/falso' })
  isDefault?: boolean;
}
