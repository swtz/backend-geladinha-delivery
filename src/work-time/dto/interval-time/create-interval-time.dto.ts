import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIntervalTimeDto {
  @IsNotEmpty({ message: 'Campo horário inicial não pode estar vazio' })
  @IsString({ message: 'Horário inválido' })
  initHour!: string;

  @IsNotEmpty({ message: 'Campo horário final não pode estar vazio' })
  @IsString({ message: 'Horário inválido' })
  endHour!: string;
}
