import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateDeliveryDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo descrição não pode estar vazio' })
  description: string;

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

  @IsUUID('4', { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo motoboy não pode estar vazio' })
  motoboy: string;

  @IsUUID('4', { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo cliente não pode estar vazio' })
  customer: string;
}
