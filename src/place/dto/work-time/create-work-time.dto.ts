import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Shift } from 'src/common/enums/work-shifts.enum';

export class CreateWorkTimeDto {
  @IsEnum(Shift, { message: 'Turno inválido' })
  shift: Shift;

  @IsNumber({}, { message: 'Número inválido' })
  initHour: number;

  @IsNumber({}, { message: 'Número inválido' })
  endHour: number;

  @IsBoolean({ message: 'O campo só permite o formato verdadeiro/falso' })
  isDefault: boolean;
}
