import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkTimeDto } from './create-work-time.dto';

export class UpdateWorkTimeDto extends PartialType(CreateWorkTimeDto) {}
