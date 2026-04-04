import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';

export class CreatePlaceDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo razão social não pode estar vazio' })
  businessName!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CNPJ não pode estar vazio' })
  cnpj!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CPF não pode estar vazio' })
  cpf!: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  secondPhone?: string;

  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({
    message: 'Campo código do estabelecimento não pode estar vazio',
  })
  code?: string;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  address!: CreateAddressDto;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  postalBox!: CreateAddressDto;

  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  workTime!: CreateWorkTimeDto;
  // socialMedias: CreateSocialMediasDto;
}
