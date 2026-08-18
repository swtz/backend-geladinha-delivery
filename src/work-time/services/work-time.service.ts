import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { WorkTime } from '../entities/work-time.entity';
import { CreateWorkTimeDto } from '../dto/work-time/create-work-time.dto';
import { UpdateWorkTimeDto } from '../dto/work-time/update-work-time.dto';
import { User } from 'src/user/entities/user.entity';
import { full, essencial, tiny } from '../data/relations/work-time';
import { generateDurationTime } from 'src/common/utils/generate-duration-time';

@Injectable()
export class WorkTimeService {
  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  async create(
    dto: CreateWorkTimeDto,
    isShared = false,
    manager?: EntityManager,
  ) {
    const duration = generateDurationTime(dto.initHour, dto.endHour);
    const workTime = {
      shift: dto.shift,
      initHour: dto.initHour.slice(11, 19),
      endHour: dto.endHour.slice(11, 19),
      duration,
      isDefault: dto.isDefault ? dto.isDefault : false,
      isShared,
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
    if (dto.initHour && dto.endHour) {
      generateDurationTime(dto.initHour, dto.endHour, workTime);
    } else if (dto.initHour) {
      generateDurationTime(dto.initHour, workTime.endHour, workTime);
    } else if (dto.endHour) {
      generateDurationTime(workTime.initHour, dto.endHour, workTime);
    }
    workTime.shift = dto.shift ?? workTime.shift;
    workTime.isDefault = dto.isDefault ?? workTime.isDefault;

    const created = await this.save(workTime, manager);
    return this.findOneByOrFail({ id: created.id }, true, manager);
  }

  async findOneBy(
    workTimeData: FindOptionsWhere<WorkTime>,
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
    workTimeData: FindOptionsWhere<WorkTime>,
    relations = true,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(WorkTime)
      : this.workTimeRepository;
    const fields = relations ? full : essencial;
    return repo.findOne({
      where: { ...workTimeData, users: { id: user.id } },
      relations: fields,
    });
  }

  async findOneByOrFail(
    workTimeData: FindOptionsWhere<WorkTime>,
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
    workTimeData: FindOptionsWhere<WorkTime>,
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

  async findAll(queryParams: FindOptionsWhere<WorkTime>) {
    return this.workTimeRepository.find({
      where: queryParams,
      order: { createdAt: 'DESC' },
      relations: tiny,
    });
  }

  async findMy(user: User) {
    return this.workTimeRepository.findOne({
      where: { users: { id: user.id } },
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
