import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { parseBrDate } from 'src/common/utils/parse-br-date';
import { PlaceService } from 'src/place/place.service';
import { WorkTimeService } from 'src/place/services/work-time.service';

@Injectable()
export class ParseBrWorkDatePipe implements PipeTransform {
  private readonly paramTypes = ['body', 'query'];

  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async transform(value: string, { type, data }: ArgumentMetadata) {
    const code = process.env.DEFAULT_PLACE_CODE;

    // se as Places forem deletadas:
    // criar uma Place sem o código
    // verificar se `code === undefined`
    // retorna place === null || Place
    // ou seja, será que ele pega a primeira que existe?
    // Se pegar, pode haver algum bug escondido aqui

    // 25/10 → sim, pega o primeiro
    // teria de checar se DEFAULT_PLACE_CODE !== undefined
    const place = await this.placeService.findOneBy({
      code,
    });

    if (!place || !value || !this.paramTypes.includes(type)) {
      return undefined;
    }

    const workTime = this.workTimeService.findDefaultFromPlace(place);

    if (!workTime) {
      throw new NotFoundException(
        'Estabelecimento sem horário padrão definido',
      );
    }

    const { initHour, endHour } = workTime;
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
