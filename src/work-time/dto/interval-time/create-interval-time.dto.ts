import { IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateIntervalTimeDto {
  @IsNotEmpty({ message: 'Campo horário inicial não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  initHour!: string;

  @IsNotEmpty({ message: 'Campo horário final não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  endHour!: string;
}
