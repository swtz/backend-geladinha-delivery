import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsNumber(
    {},
    { message: 'Campo valor total da compra precisa ser um número' },
  )
  @IsNotEmpty({ message: 'Campo valor total da compra não pode estar vazio' })
  totalPurchase: number;

  @IsNumber({}, { message: 'Campo valor da entrega precisa ser um número' })
  @IsNotEmpty({ message: 'Campo valor da entrega não pode estar vazio' })
  deliveryTax: number;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo método de pagamento não pode estar vazio' })
  paymentMethod: string;
}
