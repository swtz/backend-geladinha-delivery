import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIntervalTimeDto } from '../dto/interval-time/create-interval-time.dto';
import { User } from 'src/user/entities/user.entity';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsOrderValue,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { IntervalTime } from '../entities/interval-time.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateIntervalTimeDto } from '../dto/interval-time/update-interval-time.dto';
import { generateDurationTime } from 'src/common/utils/generate-duration-time';
import { WorkTime } from '../entities/work-time.entity';
import { getTimeFromDateIsoString } from 'src/common/utils/get-time-from-date-iso-string';

@Injectable()
export class IntervalTimeService {
  constructor(
    @InjectRepository(IntervalTime)
    private readonly intervalTimeRepository: Repository<IntervalTime>,
  ) {}
  async create(
    { initHour, endHour }: CreateIntervalTimeDto,
    user: User,
    placeDefaultWorkTime: WorkTime,
    manager?: EntityManager,
  ) {
    if (user.intervalTime) {
      throw new ConflictException(
        'Usuário já possui um Tempo de Intervalo registrado',
      );
    }
    const workTime = user.workTime ? user.workTime : placeDefaultWorkTime;
    const duration = generateDurationTime(initHour, endHour);
    const interval = {
      initHour: getTimeFromDateIsoString(initHour),
      endHour: getTimeFromDateIsoString(endHour),
      duration,
      workTime,
      user,
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
      intervalTime.duration = generateDurationTime(initHour, endHour);
    } else if (initHour) {
      intervalTime.duration = generateDurationTime(
        initHour,
        intervalTime.endHour,
      );
    } else if (endHour) {
      intervalTime.duration = generateDurationTime(
        intervalTime.initHour,
        endHour,
      );
    }
    intervalTime.initHour = initHour
      ? getTimeFromDateIsoString(initHour)
      : intervalTime.initHour;

    intervalTime.endHour = endHour
      ? getTimeFromDateIsoString(endHour)
      : intervalTime.endHour;

    const updated = await this.save(intervalTime, manager);
    return this.findOneByOrFail({ id: updated.id }, manager);
  }

  async findAll(
    queryParams: FindOptionsWhere<IntervalTime>,
    orderParams?: {
      [K in keyof FindOptionsOrder<IntervalTime>]: FindOptionsOrderValue;
    },
  ) {
    return this.intervalTimeRepository.find({
      where: queryParams,
      order: orderParams,
      relations: { workTime: { users: { roles: true }, places: true } },
    });
  }

  async findOneBy(
    intervalTimeData: FindOptionsWhere<IntervalTime>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(IntervalTime)
      : this.intervalTimeRepository;
    return repo.findOne({
      where: intervalTimeData,
      relations: { workTime: { users: { roles: true }, places: true } },
    });
  }

  async findOneByOrFail(
    intervalTimeData: FindOptionsWhere<IntervalTime>,
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

  async remove(id: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(IntervalTime)
      : this.intervalTimeRepository;
    const intervalTime = await this.findOneByOrFail({ id }, manager);

    await repo.delete({ id });
    return intervalTime;
  }
}
