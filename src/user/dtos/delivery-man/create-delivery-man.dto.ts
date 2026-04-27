import { IsNotEmptyObject, IsNumber } from 'class-validator';
import { CreateMotorcycleDto } from '../motorcycle/create-motorcycle.dto';

export class CreateDeliveryManDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  daily!: number;

  @IsNotEmptyObject({ nullable: false }, { message: 'Formato inválido' })
  motorcycle!: CreateMotorcycleDto;
}
