import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import { PlaceService } from 'src/place/place.service';
import { WorkTimeService } from 'src/work-time/work-time.service';

@Injectable()
export class ParseBrWorkDatePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async transform(value: string, { type, data }: ArgumentMetadata) {
    const code = process.env.DEFAULT_PLACE_CODE;
    const place = await this.placeService.findOneBy({
      code,
    });

    if (!place || !value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    const workTime = this.workTimeService.findDefaultFromPlaceOrFail(place);
    const { initHour, endHour } = workTime;
    const parsedValue = value.split('-').join('/');

    if (data === 'from') {
      return parseBrDate(initHour, parsedValue);
    }

    if (data === 'to') {
      return parseBrDate(endHour, parsedValue);
    }

    return undefined;
  }
}
