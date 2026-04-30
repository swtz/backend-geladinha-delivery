import { IsNumber } from 'class-validator';

export class CreateDeliveryManDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  daily!: number;
}
