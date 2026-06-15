import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { WorkTime } from '../entities/work-time.entity';
import { CreateWorkTimeDto } from '../dto/work-time/create-work-time.dto';
import { UpdateWorkTimeDto } from '../dto/work-time/update-work-time.dto';
import { User } from 'src/user/entities/user.entity';
import { FindAllParams } from '../types/findAllParams';
import { full, essencial, tiny } from '../data/relations/work-time';
import { getUnixTime, intervalToDuration, isSameDay } from 'date-fns';
import { padLeftWithChar } from 'work-time-service-create-manual-testing';

@Injectable()
export class WorkTimeService {
  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  async create(dto: CreateWorkTimeDto, manager?: EntityManager) {
    const initHour = dto.initHour.slice(11, 19);
    const endHour = dto.endHour.slice(11, 19);
    const isAnotherDay = getUnixTime(dto.initHour) > getUnixTime(dto.endHour);
    if (getUnixTime(dto.initHour) > getUnixTime(dto.endHour)) {
      throw new BadRequestException(
        'A data inicial não pode ser maior do que a data final',
      );
    }
    if (isSameDay(dto.initHour, dto.endHour) && isAnotherDay) {
      throw new BadRequestException(
        `A data final termina no dia seguinte à data inicial`,
      );
    }

    const { hours, minutes, seconds } = intervalToDuration({
      start: dto.initHour,
      end: dto.endHour,
    });
    const d2Hours = hours ? padLeftWithChar(hours, '0') : undefined;
    const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : undefined;
    const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : undefined;
    const duration = `${d2Hours || '00'}:${d2Minutes || '00'}:${d2Seconds || '00'}`;

    const workTime = {
      shift: dto.shift,
      initHour,
      endHour,
      duration,
      isDefault: dto.isDefault ? dto.isDefault : false,
    };
    const created = await this.save(workTime, manager);
    return this.findOneByOrFail({ id: created.id }, true, manager);
  }

  async update(id: string, dto: UpdateWorkTimeDto, manager?: EntityManager) {
    const workTime = await this.findOneByOrFail({ id }, false, manager);
    if (workTime.isShared) {
      throw new UnauthorizedException(
        'Um estabelecimento possui esse horário.\n Não foi possível atualizar',
      );
    }

    workTime.shift = dto.shift ?? workTime.shift;
    workTime.initHour = dto.initHour ?? workTime.initHour;
    workTime.endHour = dto.endHour ?? workTime.endHour;
    workTime.isDefault = dto.isDefault ?? workTime.isDefault;

    const created = await this.save(workTime, manager);
    return this.findOneByOrFail({ id: created.id }, true, manager);
  }

  async findOneBy(
    workTimeData: Partial<WorkTime>,
    relations = true,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(WorkTime)
      : this.workTimeRepository;
    const fields = relations ? full : essencial;
    return repo.findOne({
      where: workTimeData,
      relations: fields,
    });
  }

  async findOneOwnedBy(
    user: User,
    workTimeData: Partial<WorkTime>,
    relations = true,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(WorkTime)
      : this.workTimeRepository;
    const fields = relations ? full : essencial;
    return repo.findOne({
      where: { ...workTimeData, user: { id: user.id } },
      relations: fields,
    });
  }

  async findOneByOrFail(
    workTimeData: Partial<WorkTime>,
    relations = true,
    manager?: EntityManager,
  ) {
    const workTime = await this.findOneBy(workTimeData, relations, manager);

    if (!workTime) {
      throw new NotFoundException('Esse horário de serviço não existe');
    }

    return workTime;
  }

  async findOneOwnedByOrFail(
    user: User,
    workTimeData: Partial<WorkTime>,
    relations = true,
    manager?: EntityManager,
  ) {
    const workTime = await this.findOneOwnedBy(
      user,
      workTimeData,
      relations,
      manager,
    );

    if (!workTime) {
      throw new NotFoundException('Esse horário de serviço não existe');
    }

    return workTime;
  }

  findDefaultFromPlace(place: Place) {
    const { workTimes } = place;
    const workTime = workTimes.find(item => item.isDefault === true);
    return workTime;
  }

  findDefaultFromPlaceOrFail(place: Place) {
    const workTime = this.findDefaultFromPlace(place);

    if (!workTime) {
      throw new NotFoundException(
        'Estabelecimento sem horário padrão definido',
      );
    }

    return workTime;
  }

  failIfShiftExistsInPlace(place: Place, shift: Shift) {
    const { workTimes } = place;

    if (shift !== Shift.Custom) {
      const workTime = workTimes.find(item => item.shift === shift);

      if (workTime) {
        throw new ConflictException('O Estabelecimento já possui esse horário');
      }
    }
  }

  async findAll(queryParams: FindAllParams) {
    return this.workTimeRepository.find({
      where: queryParams,
      order: { createdAt: 'DESC' },
      relations: tiny,
    });
  }

  async findAllOwned(user: User) {
    return this.workTimeRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: tiny,
    });
  }

  async remove(id: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(WorkTime)
      : this.workTimeRepository;
    const workTime = await this.findOneByOrFail({ id }, true, manager);

    if (workTime.isDefault || workTime.isShared) {
      throw new UnauthorizedException(
        'Esse horário de serviço pertence a algum estabelecimento',
      );
    }

    await repo.delete({ id });
    return workTime;
  }

  async save(workTimeData: Partial<WorkTime>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(WorkTime)
      : this.workTimeRepository;
    return repo.save(workTimeData);
  }
}
