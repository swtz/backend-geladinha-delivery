import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTime } from '../entities/work-time.entity';
import { UserDtoType } from 'src/user/types/user.type';

export class ResponseWorkTimeDto {
  readonly id: string;
  readonly shift: Shift;
  readonly initHour: number;
  readonly endHour: number;
  readonly isDefault: boolean;
  readonly isShared: boolean;
  readonly places?: {
    id: string;
    name: string;
    businessName: string;
    phone: string;
  }[];
  readonly user?: UserDtoType;

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
      : undefined;
    this.user = workTime.user
      ? {
          id: workTime.user.id,
          name: workTime.user.name,
          phone: workTime.user.phone,
        }
      : undefined;
  }
}
