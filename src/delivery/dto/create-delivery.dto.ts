import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-methods.enum';

export class CreateDeliveryDto {
  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo descrição não pode estar vazio' })
  @MaxLength(255, {
    message: 'A descrição só pode ter no máximo 250 caracteres.',
  })
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Campo valor total da compra precisa ser um número' },
  )
  @IsNotEmpty({ message: 'Campo valor total da compra não pode estar vazio' })
  totalPurchase!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Campo valor da entrega precisa ser um número' },
  )
  @IsNotEmpty({ message: 'Campo valor da entrega não pode estar vazio' })
  deliveryTax!: number;

  @IsEnum(PaymentMethod, { message: 'Método de pagamento inválido' })
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Campo gorjeta precisa ser um número' },
  )
  tip?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  change?: number;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  motoboy!: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  customer!: string | null;

  @IsNotEmpty({ message: 'Campo estabelecimento não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  placeCode!: string;
}
