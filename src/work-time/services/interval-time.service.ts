import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { IntervalTime } from '../entities/interval-time.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { intervalToDuration } from 'date-fns';
import { padLeftWithChar } from 'src/common/utils/pad-left-with-char';

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
