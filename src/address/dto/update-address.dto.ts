import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsUUID } from 'class-validator';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsUUID('4', { message: 'Formato inválido' })
  id: string;
}
