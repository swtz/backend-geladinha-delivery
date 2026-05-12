import { Injectable } from '@nestjs/common';
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
