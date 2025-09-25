import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';
import { CreateTipDto } from './create-tip.dto';

export class UpdateTipDto extends PartialType(CreateTipDto) {
  @IsUUID('4', { message: 'Formato inválido' })
  id: string;
}
