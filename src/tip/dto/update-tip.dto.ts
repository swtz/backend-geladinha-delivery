import { IsNumber, IsUUID } from 'class-validator';

export class UpdateTipDto {
  @IsUUID('4', { message: 'Formato inválido' })
  id: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  amount: number;
}
