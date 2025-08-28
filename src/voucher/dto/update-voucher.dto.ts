import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherDto } from './create-voucher.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  id?: string;
}
