import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @IsOptional()
  @IsBoolean({ message: 'Campo pago precisa ser verdadeiro/falso' })
  paid?: boolean;
}
