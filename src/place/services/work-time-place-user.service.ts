import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { UserService } from 'src/user/services/user.service';
import { WorkTimeService } from 'src/work-time/services/work-time.service';
import { User } from 'src/user/entities/user.entity';
import { UpdateWorkTimeDto } from 'src/work-time/dto/work-time/update-work-time.dto';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';
import { CreateIntervalTimeDto } from 'src/work-time/dto/interval-time/create-interval-time.dto';
import { IntervalTimeService } from 'src/work-time/services/interval-time.service';
import { EntityManager } from 'typeorm';
import { intervalToDuration } from 'date-fns';
import { padLeftWithChar } from 'src/common/utils/pad-left-with-char';

@Injectable()
export class WorkTimePlaceUserService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
    private readonly intervalTimeService: IntervalTimeService,
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
      const defaultWorkTime =
        this.workTimeService.findDefaultFromPlaceOrFail(place);

      await this.workTimeService.save({
        ...defaultWorkTime,
        isDefault: false,
      });
      workTime.isDefault = dto.isDefault;
    }
    if (dto.initHour && dto.initHour !== dto.initHour) {
      workTime.initHour = dto.initHour.slice(11, 19);
    }
    if (dto.endHour && dto.endHour !== dto.endHour) {
      workTime.endHour = dto.endHour.slice(11, 19);
    }
    workTime.shift = dto.shift ?? workTime.shift;

    const addOneDay = workTime.initHour > workTime.endHour ? '02' : '01';
    const { hours, minutes, seconds } = intervalToDuration({
      start: `1970-01-01T${workTime.initHour}`,
      end: `1970-01-${addOneDay}T${workTime.endHour}`,
    });
    const d2Hours = hours ? padLeftWithChar(hours, '0') : undefined;
    const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : undefined;
    const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : undefined;
    const duration = `${d2Hours || '00'}:${d2Minutes || '00'}:${d2Seconds || '00'}`;

    const updated = await this.workTimeService.save({ ...workTime, duration });
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

  async setToUser(id: string, dto: CreateWorkTimeDto) {
    const user = await this.userService.findOneByOrFail({ id });
    const { workTime: oldWorkTime } = user;
    const workTime = await this.workTimeService.create(dto);
    if (oldWorkTime) {
      await this.workTimeService.remove(oldWorkTime.id);
    }
    user.workTime = workTime;
    const updated = await this.userService.save(user);
    return this.userService.findOneByOrFail({ id: updated.id });
  }

  async setSharedToUser(userId: string, workTimeId: string) {
    const user = await this.userService.findOneByOrFail({ id: userId });
    const workTime = await this.workTimeService.findOneByOrFail({
      id: workTimeId,
      isShared: true,
    });
    const { workTime: oldWorkTime } = user;

    if (oldWorkTime && !oldWorkTime.isShared) {
      await this.workTimeService.remove(oldWorkTime.id);
    }
    user.workTime = workTime;

    const updated = await this.userService.save(user);
    return this.userService.findOneByOrFail({ id: updated.id });
  }

  async createIntervalTime(
    id: string,
    { initHour, endHour }: CreateIntervalTimeDto,
    manager?: EntityManager,
  ) {
    const { workTime } = await this.userService.findOneByOrFail(
      { id },
      undefined,
      manager,
    );
    const { hours, minutes, seconds } = intervalToDuration({
      start: initHour,
      end: endHour,
    });
    const d2Hours = hours ? padLeftWithChar(hours, '0') : undefined;
    const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : undefined;
    const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : undefined;
    const duration = `${d2Hours || '00'}:${d2Minutes || '00'}:${d2Seconds || '00'}`;
    const interval = {
      initHour: initHour.slice(11, 19),
      endHour: endHour.slice(11, 19),
      duration,
      workTime,
    };
    const created = await this.intervalTimeService.save(interval, manager);
    return this.intervalTimeService.findOneByOrFail(
      { id: created.id },
      manager,
    );
  }
}
