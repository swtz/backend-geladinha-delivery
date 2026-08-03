import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class ParseEmailPipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  transform(value: string, { type }: ArgumentMetadata) {
    if (!value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    if (!isEmail(value)) {
      throw new BadRequestException('Email inválido');
    }

    return value;
  }
}
