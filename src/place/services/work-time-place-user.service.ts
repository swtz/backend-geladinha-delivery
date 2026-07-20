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
import { DataSource } from 'typeorm';
import { generateDurationTime } from 'src/common/utils/generate-duration-time';

@Injectable()
export class WorkTimePlaceUserService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
    private readonly intervalTimeService: IntervalTimeService,
    private readonly dataSource: DataSource,
  ) {}

  async addToPlace(id: string, dto: CreateWorkTimeDto, user: User) {
    return this.dataSource.transaction(async manager => {
      const place = await this.placeService.findOneByOrFail({ id }, manager);

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

      const workTime = await this.workTimeService.create(dto, manager);
      workTime.isShared = true;
      workTime.isDefault = !!dto.isDefault;

      const defaultWorkTime = dto.isDefault
        ? this.workTimeService.findDefaultFromPlace(place)
        : undefined;

      if (defaultWorkTime) {
        await this.workTimeService.save(
          {
            ...defaultWorkTime,
            isDefault: false,
          },
          manager,
        );
      }
      place.workTimes.push(workTime);

      const created = await this.placeService.save(place, manager);
      return this.placeService.findOneByOrFail({ id: created.id }, manager);
    });
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
    return this.dataSource.transaction(async manager => {
      const workTime = await this.workTimeService.findOneByOrFail(
        {
          id,
          isShared: true,
        },
        true,
        manager,
      );
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
      const place = await this.placeService.findOneByOrFail(
        { id: info.place },
        manager,
      );
      if (dto.isDefault) {
        const defaultWorkTime =
          this.workTimeService.findDefaultFromPlaceOrFail(place);

        await this.workTimeService.save(
          {
            ...defaultWorkTime,
            isDefault: false,
          },
          manager,
        );
        workTime.isDefault = dto.isDefault;
      }
      if (dto.initHour && dto.endHour) {
        generateDurationTime(dto.initHour, dto.endHour, workTime);
      } else if (dto.initHour) {
        generateDurationTime(dto.initHour, workTime.endHour, workTime);
      } else if (dto.endHour) {
        generateDurationTime(workTime.initHour, dto.endHour, workTime);
      }
      workTime.shift = dto.shift ?? workTime.shift;

      const updated = await this.workTimeService.save(workTime, manager);
      return this.workTimeService.findOneByOrFail(
        { id: updated.id },
        true,
        manager,
      );
    });
  }

  async removeShared(id: string, user: User) {
    return this.dataSource.transaction(async manager => {
      const workTime = await this.workTimeService.findOneByOrFail(
        {
          id,
          isShared: true,
        },
        true,
        manager,
      );
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

      const place = await this.placeService.findOneByOrFail(
        { id: info.place },
        manager,
      );
      if (place.workTimes.length <= 1) {
        throw new UnauthorizedException(
          `O estabelecimento ${place.businessName} possui apenas esse\nHorário de serviço`,
        );
      }

      const removed = await this.workTimeService.save(
        {
          ...workTime,
          isDefault: false,
          isShared: false,
        },
        manager,
      );

      return this.workTimeService.remove(removed.id, manager);
    });
  }

  async setToUser(id: string, dto: CreateWorkTimeDto) {
    return this.dataSource.transaction(async manager => {
      const user = await this.userService.findOneByOrFail(
        { id },
        undefined,
        manager,
      );
      const { workTime: oldWorkTime } = user;
      const workTime = await this.workTimeService.create(dto, manager);
      if (oldWorkTime && !oldWorkTime.isShared) {
        await this.workTimeService.remove(oldWorkTime.id, manager);
      }
      user.workTime = workTime;

      const updated = await this.userService.save(user, manager);
      return this.userService.findOneByOrFail(
        { id: updated.id },
        undefined,
        manager,
      );
    });
  }

  async setSharedToUser(userId: string, workTimeId: string) {
    return this.dataSource.transaction(async manager => {
      const user = await this.userService.findOneByOrFail(
        { id: userId },
        undefined,
        manager,
      );
      const workTime = await this.workTimeService.findOneByOrFail(
        {
          id: workTimeId,
          isShared: true,
        },
        true,
        manager,
      );
      const { workTime: oldWorkTime } = user;

      if (oldWorkTime && !oldWorkTime.isShared) {
        await this.workTimeService.remove(oldWorkTime.id, manager);
      }
      user.workTime = workTime;

      const updated = await this.userService.save(user, manager);
      return this.userService.findOneByOrFail(
        { id: updated.id },
        undefined,
        manager,
      );
    });
  }

  async createIntervalTime(
    id: string,
    { initHour, endHour }: CreateIntervalTimeDto,
  ) {
    return this.dataSource.transaction(async manager => {
      const { workTime } = await this.userService.findOneByOrFail(
        { id },
        undefined,
        manager,
      );
      const duration = generateDurationTime(initHour, endHour);
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
    });
  }
}
