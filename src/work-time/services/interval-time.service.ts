import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { IntervalTime } from '../entities/interval-time.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IntervalTimeService {
  constructor(
    @InjectRepository(IntervalTime)
    private readonly intervalTimeRepository: Repository<IntervalTime>,
  ) {}
  async create({ initHour, endHour }: CreateIntervalTimeDto, user: User) {
    const { workTime } = user;

    const interval = {
      initHour,
      endHour,
      workTime,
    };

    const created = await this.intervalTimeRepository.save(interval);
    return this.findOneByOrFail({ id: created.id });
  }

  async findOneBy(intervalTimeData: Partial<IntervalTime>) {
    return this.intervalTimeRepository.findOne({
      where: intervalTimeData,
      relations: { workTime: true },
    });
  }

  async findOneByOrFail(intervalTimeData: Partial<IntervalTime>) {
    const intervalTime = await this.findOneBy(intervalTimeData);
    if (!intervalTime) {
      throw new NotFoundException('Tempo de intervalo não encontrado');
    }
    return intervalTime;
  }
}
