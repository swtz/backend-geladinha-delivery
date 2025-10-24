import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import { PlaceService } from 'src/place/place.service';

@Injectable()
export class ParseBrWorkDatePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  constructor(private readonly placeService: PlaceService) {}

  async transform(value: string, { type, data }: ArgumentMetadata) {
    const code = process.env.DEFAULT_PLACE_CODE || undefined;

    // se as Places forem deletadas:
    // criar uma Place sem o código
    // verificar se `code === undefined`
    // retorna place === null || Place
    // ou seja, será que ele pega a primeira que existe?
    // Se pegar, pode haver algum bug escondido aqui
    const place = await this.placeService.findOneBy({
      code,
    });

    if (!place || !value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    const workTimes = place.workTimes.filter(item => item.isDefault === true);

    if (workTimes.length > 0) {
      const { initHour, endHour } = workTimes[0];
      const parsedValue = value.split('-').join('/');

      if (data === 'from') {
        return parseBrDate(parsedValue, initHour);
      }

      if (data === 'to') {
        return parseBrDate(parsedValue, endHour);
      }
    }

    return undefined;
  }
}
