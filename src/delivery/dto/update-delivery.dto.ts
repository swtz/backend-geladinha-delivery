import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateDeliveryDto extends PartialType(
  OmitType(CreateDeliveryDto, ['paymentMethod']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Campo pago precisa ser verdadeiro/falso' })
  paid?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  address?: string;
}
