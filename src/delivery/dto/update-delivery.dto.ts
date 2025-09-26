import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './create-delivery.dto';
import {
  IsBoolean,
  IsNotEmptyObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UpdateTipDto } from 'src/tip/dto/update-tip.dto';

export class UpdateDeliveryDto extends PartialType(
  OmitType(CreateDeliveryDto, ['tip']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Campo pago precisa ser verdadeiro/falso' })
  paid?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  address?: string;

  @IsOptional()
  @IsNotEmptyObject({}, { message: 'Campo gorjeta não pode estar vazio' })
  tip?: UpdateTipDto;
}
