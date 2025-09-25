import { IsNumber } from 'class-validator';

export class CreateTipDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  amount: number;
}
