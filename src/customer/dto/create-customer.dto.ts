import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreateCustomerDto extends CreateAddressDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone: string;
}
