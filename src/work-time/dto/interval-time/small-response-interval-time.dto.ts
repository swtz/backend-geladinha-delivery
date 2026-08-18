import { IntervalTime } from 'src/work-time/entities/interval-time.entity';

export class SmallResponseIntervalTimeDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly initHour: string;
  readonly endHour: string;
  readonly duration: string;

  constructor(intervalTime: IntervalTime) {
    this.id = intervalTime.id;
    this.createdAt = intervalTime.createdAt;
    this.updatedAt = intervalTime.updatedAt;
    this.initHour = intervalTime.initHour;
    this.endHour = intervalTime.endHour;
    this.duration = intervalTime.duration;
  }
}
