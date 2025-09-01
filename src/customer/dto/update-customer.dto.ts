import { PartialType, IntersectionType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';

export class UpdateCustomerDto extends PartialType(
  IntersectionType(CreateCustomerDto, UpdateAddressDto),
) {}
