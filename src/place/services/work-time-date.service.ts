import { BadRequestException, Injectable } from '@nestjs/common';
import { PlaceService } from '../place.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { DateObject } from 'src/payout/types/date-object.type';
import { fromZonedTime } from 'date-fns-tz';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { padLeftWithChar } from 'src/common/utils/pad-left-with-char';
import { isISO8601 } from 'class-validator';

@Injectable()
export class WorkTimeDateService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
    private readonly userService: UserService,
  ) {}

  async create(user: Partial<User>, from: string, to: string) {
    const code = process.env.DEFAULT_PLACE_CODE;
    const place = await this.placeService.findOneByOrFail({
      code,
    });

    const operator = await this.userService.findOneByOrFail(user);

    const workTime = this.workTimeService.findDefaultFromPlaceOrFail(place);
    const { initHour, endHour } = operator.workTime
      ? operator.workTime
      : workTime;

    if (
      !isISO8601(from, { strict: true }) ||
      !isISO8601(to, { strict: true })
    ) {
      throw new BadRequestException('Data inválida');
    }

    // `11/12/2025 21`;
    // `2025-12-11T21:00:00`;
    const fromDate = from.slice(0, 10);
    const toDate = to.slice(0, 10);

    const twoDigitInitHour = padLeftWithChar(initHour, '0');
    const twoDigitEndHour = padLeftWithChar(endHour, '0');

    const utcInitDate = fromZonedTime(
      `${fromDate}T${twoDigitInitHour}:00:00`,
      'America/Sao_Paulo',
    );
    const utcEndDate = fromZonedTime(
      `${toDate}T${twoDigitEndHour}:00:00`,
      'America/Sao_Paulo',
    );

    const initDate = utcInitDate;
    const endDate = utcEndDate;
    const dateObject: DateObject = {
      initDate,
      endDate,
    };

    const initHourChanged = [21, 22, 23].includes(initHour);
    const endHourChanged = [21, 22, 23].includes(endHour);

    if (!initHourChanged || !endHourChanged) {
      if (endHour < initHour) {
        dateObject.endDate = generateRelativeDate(
          'tomorrow',
          endHour,
          utcEndDate,
        );
      }
    }

    // se initHour || endHour in [21, 22, 23]
    // Eu sei que initDate || endDate em UTC
    // ficará com a data do dia posterior

    // se initHour in [21, 22, 23]
    // se endHour not in [21, 22 ,23]
    // generateRelativeDate(initDate, endHour)

    // Se surgir a necessidade:
    // "Eu quero a mesma data só que com o horário diferente"
    // Como resolver?

    return dateObject;
  }
}
