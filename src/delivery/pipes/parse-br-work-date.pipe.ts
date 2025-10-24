import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import { PlaceService } from 'src/place/place.service';

@Injectable()
export class ParseBrWorkDatePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  constructor(private readonly placeService: PlaceService) {}

  async transform(value: string, { type, data }: ArgumentMetadata) {
    const code = process.env.DEFAULT_PLACE_CODE || undefined;
    const place = await this.placeService.findOneBy({
      code,
    });

    if (!place || !value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    const { workTimes } = place;
    const { initHour, endHour } = workTimes.filter(item =>
      Boolean(item.isDefault),
    )[0];

    const parsedValue = value.split('-').join('/');

    if (data === 'from') {
      return parseBrDate(parsedValue, initHour);
    }

    if (data === 'to') {
      return parseBrDate(parsedValue, endHour);
    }

    return undefined;
  }
}
