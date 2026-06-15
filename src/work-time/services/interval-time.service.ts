import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { IntervalTime } from '../entities/interval-time.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { intervalToDuration } from 'date-fns';
import { padLeftWithChar } from 'src/common/utils/pad-left-with-char';
import { UpdateIntervalTimeDto } from '../dto/interval-time/update-interval-time.dto';

@Injectable()
export class IntervalTimeService {
  constructor(
    @InjectRepository(IntervalTime)
    private readonly intervalTimeRepository: Repository<IntervalTime>,
  ) {}
  async create(
    { initHour, endHour }: CreateIntervalTimeDto,
    user: User,
    manager?: EntityManager,
  ) {
    const { workTime } = user;
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
    const created = await this.save(interval, manager);
    return this.findOneByOrFail({ id: created.id }, manager);
  }

  async update(
    id: string,
    { initHour, endHour }: UpdateIntervalTimeDto,
    manager?: EntityManager,
  ) {
    const intervalTime = await this.findOneByOrFail({ id }, manager);
    if (initHour && intervalTime.initHour !== initHour) {
      intervalTime.initHour = initHour.slice(11, 19);
    }
    if (endHour && intervalTime.endHour !== endHour) {
      intervalTime.endHour = endHour.slice(11, 19);
    }
    const addOneDay =
      intervalTime.initHour > intervalTime.endHour ? '02' : '01';
    const { hours, minutes, seconds } = intervalToDuration({
      start: `1970-01-01T${intervalTime.initHour}`,
      end: `1970-01-${addOneDay}T${intervalTime.endHour}`,
    });
    const d2Hours = hours ? padLeftWithChar(hours, '0') : undefined;
    const d2Minutes = minutes ? padLeftWithChar(minutes, '0') : undefined;
    const d2Seconds = seconds ? padLeftWithChar(seconds, '0') : undefined;
    const duration = `${d2Hours || '00'}:${d2Minutes || '00'}:${d2Seconds || '00'}`;

    const updated = await this.save({ ...intervalTime, duration }, manager);
    return this.findOneByOrFail({ id: updated.id }, manager);
  }

  async findOneBy(
    intervalTimeData: Partial<IntervalTime>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(IntervalTime)
      : this.intervalTimeRepository;
    return repo.findOne({
      where: intervalTimeData,
      relations: { workTime: true },
    });
  }

  async findOneByOrFail(
    intervalTimeData: Partial<IntervalTime>,
    manager?: EntityManager,
  ) {
    const intervalTime = await this.findOneBy(intervalTimeData, manager);
    if (!intervalTime) {
      throw new NotFoundException('Tempo de intervalo não encontrado');
    }
    return intervalTime;
  }

  async save(intervalTime: Partial<IntervalTime>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(IntervalTime)
      : this.intervalTimeRepository;
    return repo.save(intervalTime);
  }
}
