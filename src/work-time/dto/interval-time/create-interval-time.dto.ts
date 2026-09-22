import { IsISO8601, IsNotEmpty, Length } from 'class-validator';

export class CreateIntervalTimeDto {
  @IsNotEmpty({ message: 'Campo horário inicial não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  @Length(19, 19, { message: 'Tamanho inválido' })
  initHour!: string;

  @IsNotEmpty({ message: 'Campo horário final não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  @Length(19, 19, { message: 'Tamanho inválido' })
  endHour!: string;
}
