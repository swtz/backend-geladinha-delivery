import { BadRequestException, Injectable } from '@nestjs/common';
import { PlaceService } from './place.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { UserService } from 'src/user/services/user.service';
import { User } from 'src/user/entities/user.entity';
import { fromZonedTime } from 'date-fns-tz';
import { getUnixTime, isSameDay } from 'date-fns';
import { isISO8601 } from 'class-validator';

@Injectable()
export class WorkTimeDateService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly workTimeService: WorkTimeService,
    private readonly userService: UserService,
  ) {}

  async create(
    user: Partial<User>,
    from: string,
    to: string,
    tz = 'America/Sao_Paulo',
  ) {
    if (
      !isISO8601(from, { strict: true }) ||
      !isISO8601(to, { strict: true })
    ) {
      throw new BadRequestException('Data inválida');
    }
    const code = process.env.DEFAULT_PLACE_CODE;
    const place = await this.placeService.findOneByOrFail({
      code,
    });
    const hasUserData = Object.values(user).some(value => value !== undefined);
    const userObject: Record<string, Partial<User> | null> = {
      operator: hasUserData
        ? await this.userService.findOneByOrFail(user)
        : null,
    };
    const { initHour, endHour } = userObject.operator?.workTime
      ? userObject.operator.workTime
      : this.workTimeService.findDefaultFromPlaceOrFail(place);

    const fromDate = from.slice(0, 10);
    const toDate = to.slice(0, 10);
    if (getUnixTime(fromDate) > getUnixTime(toDate)) {
      throw new BadRequestException(
        'A data inicial não pode ser maior do que a data final',
      );
    }

    const utcInitDate = fromZonedTime(`${fromDate}T${initHour}`, tz);
    const utcEndDate = fromZonedTime(`${toDate}T${endHour}`, tz);
    const isAnotherDay =
      getUnixTime(`${fromDate}T${initHour}`) >
      getUnixTime(`${fromDate}T${endHour}`);

    const prettyDate = utcInitDate.toLocaleDateString('pt-BR', {
      dateStyle: 'short',
    });
    if (isSameDay(fromDate, toDate) && isAnotherDay) {
      throw new BadRequestException(
        `A data final termina no dia seguinte à ${prettyDate}`,
      );
    }

    return {
      initDate: utcInitDate,
      endDate: utcEndDate,
    };
  }
}
