import { Shift } from 'src/common/enums/work-shifts.enum';
import { User } from 'src/user/entities/user.entity';
import { WorkTime } from '../entities/work-time.entity';

export class ResponseWorkTimeDto {
  readonly id: string;
  readonly shift: Shift;
  readonly initHour: number;
  readonly endHour: number;
  readonly isDefault: boolean;
  readonly isShared: boolean;
  readonly places:
    | {
        id: string;
        name: string;
        businessName: string;
        phone: string;
      }[]
    | null;
  readonly user: Pick<User, 'id' | 'name' | 'phone'> | null;

  constructor(workTime: WorkTime) {
    this.id = workTime.id;
    this.shift = workTime.shift;
    this.initHour = workTime.initHour;
    this.endHour = workTime.endHour;
    this.isDefault = workTime.isDefault;
    this.isShared = workTime.isShared;
    this.places = workTime.places
      ? workTime.places.map(item => {
          return {
            id: item.id,
            name: item.name,
            businessName: item.businessName,
            phone: item.phone,
          };
        })
      : null;
    this.user = workTime.user
      ? {
          id: workTime.user.id,
          name: workTime.user.name,
          phone: workTime.user.phone,
        }
      : null;
  }
}
