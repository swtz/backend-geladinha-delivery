import { IntervalTime } from 'src/work-time/entities/interval-time.entity';
import { ResponseWorkTimeDto } from '../work-time/response-work-time.dto';

export class ResponseIntervalTimeDto {
  readonly id: string;
  readonly initHour: string;
  readonly endHour: string;
  readonly duration: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly workTime: Pick<
    ResponseWorkTimeDto,
    'id' | 'shift' | 'duration' | 'initHour' | 'endHour' | 'user' | 'places'
  >;

  constructor(intervalTime: IntervalTime) {
    this.id = intervalTime.id;
    this.initHour = intervalTime.initHour;
    this.endHour = intervalTime.endHour;
    this.duration = intervalTime.duration;
    this.createdAt = intervalTime.createdAt;
    this.updatedAt = intervalTime.updatedAt;
    this.workTime = {
      id: intervalTime.workTime.id,
      shift: intervalTime.workTime.shift,
      initHour: intervalTime.workTime.initHour,
      endHour: intervalTime.workTime.endHour,
      duration: intervalTime.workTime.duration,
      places:
        intervalTime.workTime.places && intervalTime.workTime.places.length > 0
          ? intervalTime.workTime.places.map(place => {
              return {
                id: place.id,
                name: place.name,
                businessName: place.businessName,
                phone: place.phone,
              };
            })
          : null,
      user:
        intervalTime.workTime.user && intervalTime.workTime.user.length > 0
          ? intervalTime.workTime.user.map(user => {
              return {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                nickname: user.nickname,
                phone: user.phone,
              };
            })
          : null,
    };
  }
}
