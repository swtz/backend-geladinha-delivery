import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTime } from 'src/work-time/entities/work-time.entity';

export class MediumResponseWorkTimeDto {
  readonly id: string;
  readonly shift: Shift;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly initHour: string;
  readonly endHour: string;
  readonly duration: string;
  readonly isDefault: boolean;
  readonly isShared: boolean;

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
  }
}
