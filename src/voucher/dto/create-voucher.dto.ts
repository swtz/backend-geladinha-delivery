import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateVoucherDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Campo quantidade precisa ser um número' },
  )
  @IsNotEmpty({ message: 'Campo quantidade não pode estar vazio' })
  amount!: number;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @MaxLength(30, {
    message: 'A descrição só pode ter no máximo 30 caracteres.',
  })
  description?: string;
}
