import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Shift } from 'src/common/enums/work-shifts.enum';

export class CreateWorkTimeDto {
  @IsNotEmpty({ message: 'Campo turno não pode estar vazio' })
  @IsEnum(Shift, { message: 'Turno inválido' })
  shift!: Shift;

  @IsNotEmpty({ message: 'Campo horário inicial não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  @MinLength(19, { message: 'Tamanho inválido' })
  initHour!: string;

  @IsNotEmpty({ message: 'Campo horário final não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Horário inválido' })
  @MinLength(19, { message: 'Tamanho inválido' })
  endHour!: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo só permite o formato verdadeiro/falso' })
  isDefault?: boolean;
}
