import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';
import { Type } from 'class-transformer';

export class CreatePlaceDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  @MaxLength(255, { message: 'O nome só pode ter no máximo 250 caracteres' })
  name!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo razão social não pode estar vazio' })
  @MaxLength(255, {
    message: 'A razão social só pode ter no máximo 250 caracteres',
  })
  businessName!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CNPJ não pode estar vazio' })
  @MaxLength(18, { message: 'O CNPJ só pode ter no máximo 18 caracteres' })
  cnpj!: string;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo CPF não pode estar vazio' })
  @MaxLength(14, { message: 'O CPF só pode ter no máximo 14 caracteres' })
  cpf: string | undefined;

  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  secondPhone: string | undefined;

  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({
    message: 'Campo código do estabelecimento não pode estar vazio',
  })
  code!: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  postalBox?: CreateAddressDto | undefined;

  @ValidateNested()
  @Type(() => CreateWorkTimeDto)
  workTime!: CreateWorkTimeDto;
}
