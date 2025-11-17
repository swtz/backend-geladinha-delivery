import { Injectable } from '@nestjs/common';
import { PlaceService } from '../place.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { DateObject } from 'src/payout/types/date-object.type';
import { fromZonedTime } from 'date-fns-tz';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { DateTime } from '../types/date-time.type';

@Injectable()
export class WorkTimeDateService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
    private readonly userService: UserService,
  ) {}

  async create(
    user: Partial<User>,
    {
      year: fYear = `${new Date().getFullYear()}`,
      month: fMonth = `${new Date().getMonth() + 1}`,
      day: fDay = `${new Date().getDate()}`,
      hours: fHours,
      minutes: fMinutes,
    }: DateTime,
    {
      year: tYear = `${new Date().getFullYear()}`,
      month: tMonth = `${new Date().getMonth() + 1}`,
      day: tDay = `${new Date().getDate()}`,
      hours: tHours,
      minutes: tMinutes,
    }: DateTime,
  ) {
    const code = process.env.DEFAULT_PLACE_CODE;
    const place = await this.placeService.findOneByOrFail({
      code,
    });

    const operator = await this.userService.findOneByOrFail(user);

    const workTime = this.workTimeService.findDefaultFromPlaceOrFail(place);
    const { initHour, endHour } = operator.workTime
      ? operator.workTime
      : workTime;

    // `11/12/2025 21`;
    // `2025-12-11T21:00:00`;
    const dblDigitInitHour = `${fHours || initHour}`.padStart(2, '0');
    const dblDigitEndHour = `${tHours || endHour}`.padStart(2, '0');

    const dblDigitFromDay = `${fDay}`.padStart(2, '0');
    const dblDigitToDay = `${tDay}`.padStart(2, '0');

    const dblDigitFromMinutes = `${fMinutes || '00'}`.padStart(2, '0');
    const dblDigitToMinutes = `${tMinutes || '00'}`.padStart(2, '0');

    const fromDateString = `${fYear}-${fMonth}-${dblDigitFromDay}T${dblDigitInitHour}:${dblDigitFromMinutes}:00`;
    const toDateString = `${tYear}-${tMonth}-${dblDigitToDay}T${dblDigitEndHour}:${dblDigitToMinutes}:00`;

    const utcInitDate = fromZonedTime(fromDateString, 'America/Sao_Paulo');
    const utcEndDate = fromZonedTime(toDateString, 'America/Sao_Paulo');

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
