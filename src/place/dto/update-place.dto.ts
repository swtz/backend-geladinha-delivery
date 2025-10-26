import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';
import { IsNotEmptyObject, IsOptional, IsUUID } from 'class-validator';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { UpdateDefaultWorkTimeDto } from 'src/work-time/dto/update-default-work-time.dto';

export class UpdatePlaceDto extends OmitType(PartialType(CreatePlaceDto), [
  'address',
  'postalBox',
  'workTime',
]) {
  @IsOptional()
  @IsNotEmptyObject({ nullable: false }, { message: 'Formato inválido' })
  address?: UpdateAddressDto;

  @IsOptional()
  @IsNotEmptyObject({ nullable: false }, { message: 'Formato inválido' })
  postalBox?: UpdateAddressDto;

  @IsOptional()
  @IsNotEmptyObject({ nullable: false }, { message: 'Formato inválido' })
  workTime?: UpdateDefaultWorkTimeDto;

  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  ownerId?: string;
}
