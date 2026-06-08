import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkTimeDto } from './create-work-time.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateWorkTimeDto extends PartialType(CreateWorkTimeDto) {
  @IsOptional()
  @IsUUID('4', { message: 'Formato inválido' })
  id?: string;
}
