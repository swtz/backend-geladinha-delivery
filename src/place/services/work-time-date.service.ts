import { BadRequestException, Injectable } from '@nestjs/common';
import { PlaceService } from '../place.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { fromZonedTime } from 'date-fns-tz';
import { generateRelativeDate } from 'src/common/utils/generate-date';
import { padLeftWithChar } from 'src/common/utils/pad-left-with-char';
import { isISO8601 } from 'class-validator';
import { FindUserDto } from 'src/user/dtos/user/find-user.dto';

@Injectable()
export class WorkTimeDateService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
    private readonly userService: UserService,
  ) {}

  async create(user: FindUserDto, from: string, to: string) {
    const code = process.env.DEFAULT_PLACE_CODE;
    const place = await this.placeService.findOneByOrFail({
      code,
    });

    const userObject: Record<string, Partial<User> | null> = { operator: {} };
    let hasUserData = false;

    const dateObject: {
      initHour: number;
      endHour: number;
      initDate: Date;
      endDate: Date;
    } = {
      initHour: 0,
      endHour: 0,
      initDate: new Date(),
      endDate: new Date(),
    };

    hasUserData = Object.values(user).some(value => value !== undefined);

    userObject.operator = hasUserData
      ? await this.userService.findOneByOrFail(user)
      : null;

    const { initHour, endHour } =
      userObject.operator && userObject.operator.workTime
        ? userObject.operator.workTime
        : this.workTimeService.findDefaultFromPlaceOrFail(place);

    dateObject.initHour = initHour;
    dateObject.endHour = endHour;

    if (
      !isISO8601(from, { strict: true }) ||
      !isISO8601(to, { strict: true })
    ) {
      throw new BadRequestException('Data inválida');
    }

    const fromDate = from.slice(0, 10);
    const toDate = to.slice(0, 10);

    const twoDigitInitHour = padLeftWithChar(dateObject.initHour, '0');
    const twoDigitEndHour = padLeftWithChar(dateObject.endHour, '0');

    const utcInitDate = fromZonedTime(
      `${fromDate}T${twoDigitInitHour}:00:00`,
      'America/Sao_Paulo',
    );
    const utcEndDate = fromZonedTime(
      `${toDate}T${twoDigitEndHour}:00:00`,
      'America/Sao_Paulo',
    );

    dateObject.initDate = utcInitDate;
    dateObject.endDate = utcEndDate;

    const initHourChanged = [21, 22, 23].includes(dateObject.initHour);
    const endHourChanged = [21, 22, 23].includes(dateObject.endHour);

    if (!initHourChanged || !endHourChanged) {
      if (dateObject.endHour < dateObject.initHour) {
        dateObject.endDate = generateRelativeDate(
          'tomorrow',
          dateObject.endHour,
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

    return { initDate: dateObject.initDate, endDate: dateObject.endDate };
  }
}
