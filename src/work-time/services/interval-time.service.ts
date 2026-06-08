import { Injectable } from '@nestjs/common';
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
    return this.intervalTimeRepository.findOneOrFail({
      where: { id: created.id },
      relations: { workTime: true },
    });
  }
}
