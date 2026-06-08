import { Shift } from 'src/common/enums/work-shifts.enum';
import { WorkTime } from '../../entities/work-time.entity';
import { UserResponseDtoType } from 'src/user/types/user/user.type';

export class ResponseWorkTimeDto {
  readonly id: string;
  readonly shift: Shift;
  readonly initHour: Date;
  readonly endHour: Date;
  readonly duration: Date;
  readonly isDefault: boolean;
  readonly isShared: boolean;
  readonly places?: {
    id: string;
    name: string;
    businessName: string;
    phone: string;
  }[];
  readonly user?: UserResponseDtoType[];

  constructor(workTime: WorkTime) {
    this.id = workTime.id;
    this.shift = workTime.shift;
    this.initHour = workTime.initHour;
    this.endHour = workTime.endHour;
    this.duration = workTime.duration;
    this.isDefault = workTime.isDefault;
    this.isShared = workTime.isShared;
    this.places = workTime.places
      ? workTime.places.map(place => {
          return {
            id: place.id,
            name: place.name,
            businessName: place.businessName,
            phone: place.phone,
          };
        })
      : undefined;
    this.user = workTime.user
      ? workTime.user.map(user => {
          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
          };
        })
      : undefined;
  }
}
