import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDefaultWorkTimeDto {
  @IsNotEmpty({ message: 'Campo hora inicial não pode estar vazio' })
  @IsNumber({}, { message: 'Número inválido' })
  initHour: number;

  @IsNotEmpty({ message: 'Campo hora final não pode estar vazio' })
  @IsNumber({}, { message: 'Número inválido' })
  endHour: number;
}
