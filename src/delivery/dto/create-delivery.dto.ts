import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-methods.enum';

export class CreateDeliveryDto {
  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo descrição não pode estar vazio' })
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

  @IsUUID('4', { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo motoboy não pode estar vazio' })
  motoboy!: string;

  @IsUUID('4', { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo cliente não pode estar vazio' })
  customer!: string;
}
