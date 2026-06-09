import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { UserService } from 'src/user/services/user.service';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { User } from 'src/user/entities/user.entity';
import { UpdateWorkTimeDto } from 'src/work-time/dto/work-time/update-work-time.dto';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';

@Injectable()
export class WorkTimePlaceUserService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async addToPlace(id: string, dto: CreateWorkTimeDto, user: User) {
    const place = await this.placeService.findOneByOrFail({ id });

    const isOwner = place.owners.some(owner => owner.id === user.id);
    if (!isOwner) {
      throw new ForbiddenException('Acesso negado');
    }

    if (place.workTimes.length >= 5) {
      throw new InternalServerErrorException(
        'Só é possível cadastrar 5 horários por estabelecimento',
      );
    }
    this.workTimeService.failIfShiftExistsInPlace(place, dto.shift);

    const workTime = await this.workTimeService.create(dto);
    workTime.isShared = true;
    workTime.isDefault = !!dto.isDefault;

    const defaultWorkTime = dto.isDefault
      ? this.workTimeService.findDefaultFromPlace(place)
      : undefined;

    if (defaultWorkTime) {
      await this.workTimeService.save({
        ...defaultWorkTime,
        isDefault: false,
      });
    }
    place.workTimes.push(workTime);

    const created = await this.placeService.save(place);
    return this.placeService.findOneByOrFail({ id: created.id });
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

  async removeShared(id: string, user: User) {
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
    if (place.workTimes.length <= 1) {
      throw new UnauthorizedException(
        `O estabelecimento ${place.businessName} possui apenas esse\nHorário de serviço`,
      );
    }

    const removed = await this.workTimeService.save({
      ...workTime,
      isDefault: false,
      isShared: false,
    });

    return this.workTimeService.remove(removed.id);
  }
}
