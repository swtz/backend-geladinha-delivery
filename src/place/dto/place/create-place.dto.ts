import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateWorkTimeDto } from '../work-time/create-work-time.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePlaceDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo razão social não pode estar vazio' })
  businessName: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CNPJ não pode estar vazio' })
  cnpj: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CPF não pode estar vazio' })
  cpf: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  secondPhone?: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsUUID('4', { message: 'Formato inválido' })
  ownerId: string;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  Address: CreateAddressDto;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  postalBox: CreateAddressDto;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  workTime: CreateWorkTimeDto;
  // socialMedias: CreateSocialMediasDto;
}
