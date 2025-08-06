import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateVoucherDto {
  @IsNumber({}, { message: 'Campo quantidade precisa ser um número' })
  @IsNotEmpty({ message: 'Campo quantidade não pode estar vazio' })
  amount: number;

  @IsString({ message: 'Formato inválido' })
  @MaxLength(30, {
    message: 'A descrição só pode ter no máximo 30 caracteres.',
  })
  description?: string;
}
