import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Shift } from 'src/common/enums/work-shifts.enum';

export class CreateWorkTimeDto {
  @IsNotEmpty({ message: 'Campo turno não pode estar vazio' })
  @IsEnum(Shift, { message: 'Turno inválido' })
  shift: Shift;

  @IsNotEmpty({ message: 'Campo hora inicial não pode estar vazio' })
  @IsNumber({}, { message: 'Número inválido' })
  initHour: number;

  @IsNotEmpty({ message: 'Campo hora final não pode estar vazio' })
  @IsNumber({}, { message: 'Número inválido' })
  endHour: number;

  @IsOptional()
  @IsBoolean({ message: 'O campo só permite o formato verdadeiro/falso' })
  isDefault: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O campo só permite o formato verdadeiro/falso' })
  isShared: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  place: string;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  user: string;
}
