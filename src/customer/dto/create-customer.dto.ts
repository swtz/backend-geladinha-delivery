import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreateCustomerDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone: string;

  @IsNotEmptyObject(
    {},
    { message: 'Campo endereço precisa ser preenchido corretamente' },
  )
  address: CreateAddressDto;
}
