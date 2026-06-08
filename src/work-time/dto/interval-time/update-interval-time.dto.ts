import { PartialType } from '@nestjs/mapped-types';
import { CreateIntervalTimeDto } from './create-interval-time.dto';

export class UpdateIntervalTimeDto extends PartialType(CreateIntervalTimeDto) {}
