import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PlaceService } from '../place.service';
import { UserService } from 'src/user/user.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WorkTimePlaceUserService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async addWorkTimeToPlace(workTimeId: string, placeId: string) {
    const workTime = await this.workTimeService.findOneByOrFail(
      { id: workTimeId },
      true,
    );
    const place = await this.placeService.findOneByOrFail({ id: placeId });

    this.workTimeService.failIfShiftExistsInPlace(place, workTime.shift);

    if (place.workTimes.length >= 5) {
      throw new InternalServerErrorException(
        'Só é possível cadastrar 5 horários por estabelecimento',
      );
    }

    const defaultWorkTime = this.workTimeService.findDefaultFromPlace(place);

    workTime.places.push(place);

    if (workTime.isDefault && defaultWorkTime) {
      await this.workTimeService.save({
        ...defaultWorkTime,
        isDefault: false,
      });
    }

    const created = await this.workTimeService.save({
      ...workTime,
      isShared: true,
    });
    return this.workTimeService.findOneByOrFail({ id: created.id }, true);
  }

  async updateUserWorkTime(workTimeId: string, userId: string) {
    const workTime = await this.workTimeService.findOneByOrFail({
      id: workTimeId,
    });
    const user = await this.userService.findOneByOrFail({ id: userId });

    await this.userService.save({ ...user, workTime });
    return this.workTimeService.findOneByOrFail({ id: workTime.id });
  }

  async useIsSharedWorkTime(id: string, user: User) {
    const sharedWorkTime = await this.workTimeService.findOneByOrFail({
      id,
      isShared: true,
    });

    sharedWorkTime.user.push(user);

    const updatedWorkTime = await this.workTimeService.save(sharedWorkTime);
    return this.workTimeService.findOneByOrFail({ id: updatedWorkTime.id });
  }
}
