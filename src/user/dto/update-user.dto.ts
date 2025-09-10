import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Campo gorjeta precisa ser um número' },
  )
  tip?: number;
}
