import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import { fromZonedTime } from 'date-fns-tz';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';

@Injectable()
export class ParseTimezoneDatePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  constructor(private readonly workTimeDateService: WorkTimeDateService) {}

  async transform(value: string, { type, data }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    if (!isISO8601(value, { strict: true })) {
      throw new BadRequestException('Data inválida');
    }

    // if (data === 'user') ...

    const dateObject = await this.workTimeDateService.create_new({}, '', '');

    return fromZonedTime(value, 'America/Sao_Paulo');
  }
}
