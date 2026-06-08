import { IntervalTime } from 'src/work-time/entities/interval-time.entity';
import { SmallResponseWorkTime } from 'src/work-time/types/small-response-work-time.type';

export class ResponseIntervalTimeDto {
  readonly id: string;
  readonly initHour: Date;
  readonly endHour: Date;
  readonly duration: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly workTime: SmallResponseWorkTime;

  constructor(intervalTime: IntervalTime) {
    this.id = intervalTime.id;
    this.initHour = intervalTime.initHour;
    this.endHour = intervalTime.endHour;
    this.duration = intervalTime.duration;
    this.createdAt = intervalTime.createdAt;
    this.updatedAt = intervalTime.updatedAt;
    this.id = intervalTime.id;
    this.workTime = {
      id: intervalTime.workTime.id,
      shift: intervalTime.workTime.shift,
      initHour: intervalTime.workTime.initHour,
      endHour: intervalTime.workTime.endHour,
    };
  }
}
