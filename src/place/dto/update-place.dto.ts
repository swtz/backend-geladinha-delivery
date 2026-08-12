import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';

export class UpdatePlaceDto extends OmitType(PartialType(CreatePlaceDto), [
  'address',
  'postalBox',
  'workTime',
]) {}
