import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['address']),
) {
  @IsOptional()
  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  address?: UpdateAddressDto;
}
