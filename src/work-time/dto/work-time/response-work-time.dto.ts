import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTime } from '../../entities/work-time.entity';
import { ResponseIntervalTimeDto } from '../interval-time/response-interval-time.dto';
import { SmallResponsePlaceDto } from 'src/place/dto/small-response-place.dto';
import { ResponseUserDto } from 'src/user/dtos/user/response-user.dto';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';
import { SmallResponseIntervalTimeDto } from '../interval-time/small-response-interval-time.dto';

export class ResponseWorkTimeDto {
  readonly id: string;
  readonly shift: Shift;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly initHour: string;
  readonly endHour: string;
  readonly duration: string;
  readonly isDefault: boolean;
  readonly isShared: boolean;
  readonly places: SmallResponsePlaceDto[] | null;
  readonly users: SmallResponseUserDto[] | null;
  readonly intervalTimes: SmallResponseIntervalTimeDto[] | null;

  constructor(workTime: WorkTime) {
    this.id = workTime.id;
    this.createdAt = workTime.createdAt;
    this.updatedAt = workTime.updatedAt;
    this.shift = workTime.shift;
    this.initHour = workTime.initHour;
    this.endHour = workTime.endHour;
    this.duration = workTime.duration;
    this.isDefault = workTime.isDefault;
    this.isShared = workTime.isShared;
    this.places =
      workTime.places && workTime.places.length > 0
        ? workTime.places.map(place => {
            return new SmallResponsePlaceDto(place);
          })
        : null;
    this.users =
      workTime.users && workTime.users.length > 0
        ? workTime.users.map(user => {
            return new ResponseUserDto(user);
          })
        : null;
    this.intervalTimes =
      workTime.intervalTimes && workTime.intervalTimes.length > 0
        ? workTime.intervalTimes.map(intervalTime => {
            return new ResponseIntervalTimeDto(intervalTime);
          })
        : null;
  }
}
