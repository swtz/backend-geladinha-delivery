import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmptyObject, IsOptional } from 'class-validator';
import { UpdateWorkTimeDto } from 'src/work-time/dto/update-work-time.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'workTime']),
) {
  @IsOptional()
  @IsNotEmptyObject({}, { message: 'Formato inválido' })
  workTime?: UpdateWorkTimeDto;
}
