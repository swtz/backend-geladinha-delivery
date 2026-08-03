import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdatePlaceDto extends OmitType(PartialType(CreatePlaceDto), [
  'address',
  'postalBox',
  'workTime',
]) {
  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  ownerId?: string; // usar req.user.id ao invés desse campo!
}
