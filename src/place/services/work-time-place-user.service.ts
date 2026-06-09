import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { UserService } from 'src/user/services/user.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { User } from 'src/user/entities/user.entity';
import { UpdateWorkTimeDto } from 'src/work-time/dto/work-time/update-work-time.dto';

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

  async updateShared(id: string, dto: UpdateWorkTimeDto, user: User) {
    const workTime = await this.workTimeService.findOneByOrFail({
      id,
      isShared: true,
    });
    const { places } = workTime;

    let isOwner = false;
    let info: { owner?: string; place?: string } = {};
    places.forEach(place => {
      isOwner = place.owners.some(owner => {
        if (owner.id === user.id) {
          info = {
            owner: owner.id,
            place: place.id,
          };
        }
        return owner.id === user.id;
      });
    });
    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }
    const place = await this.placeService.findOneByOrFail({
      id: info.place,
    });
    if (dto.isDefault) {
      const defaultWorkTime = this.workTimeService.findDefaultFromPlace(place);

      if (defaultWorkTime) {
        await this.workTimeService.save({
          ...defaultWorkTime,
          isDefault: false,
        });
      }
    }

    workTime.shift = dto.shift ?? workTime.shift;
    workTime.initHour = dto.initHour ?? workTime.initHour;
    workTime.endHour = dto.endHour ?? workTime.endHour;
    workTime.isDefault = dto.isDefault ?? workTime.isDefault;

    const updated = await this.workTimeService.save(workTime);
    return this.workTimeService.findOneByOrFail({ id: updated.id });
  }
}
