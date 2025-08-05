import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryManDto } from './create-delivery-man.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateDeliveryManDto extends PartialType(
  OmitType(CreateDeliveryManDto, ['password']),
) {
  @IsOptional()
  @IsNumber({}, { message: 'Campo gorjeta precisa ser um número' })
  tip?: number;
}
