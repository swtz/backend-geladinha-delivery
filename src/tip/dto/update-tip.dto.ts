import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateTipDto {
  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  id?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  amount?: number;
}
