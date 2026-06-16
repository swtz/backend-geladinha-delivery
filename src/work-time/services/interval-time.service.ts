import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { IntervalTime } from '../entities/interval-time.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateIntervalTimeDto } from '../dto/interval-time/update-interval-time.dto';
import { generateDurationTime } from 'src/common/utils/generate-duration-time';

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
    const duration = generateDurationTime(initHour, endHour);
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
    if (initHour && endHour) {
      generateDurationTime(initHour, endHour, intervalTime);
    } else if (initHour) {
      generateDurationTime(initHour, intervalTime.endHour, intervalTime);
    } else if (endHour) {
      generateDurationTime(intervalTime.initHour, endHour, intervalTime);
    }
    const updated = await this.save(intervalTime, manager);
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
