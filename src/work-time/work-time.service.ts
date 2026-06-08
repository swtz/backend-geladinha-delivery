import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { WorkTime } from './entities/work-time.entity';
import { CreateWorkTimeDto } from './dto/work-time/create-work-time.dto';
import { UpdateWorkTimeDto } from './dto/work-time/update-work-time.dto';
import { User } from 'src/user/entities/user.entity';
import { FindAllParams } from './types/findAllParams';
import { full, essencial, tiny } from './data/relations/work-time';

@Injectable()
export class WorkTimeService {
  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  async create(dto: CreateWorkTimeDto) {
    const workTime = {
      shift: dto.shift,
      initHour: dto.initHour,
      endHour: dto.endHour,
      isDefault: dto.isDefault ? dto.isDefault : false,
    };

    const created = await this.save(workTime);
    return this.findOneByOrFail({ id: created.id });
  }

  async update(id: string, dto: UpdateWorkTimeDto, isDefault = false) {
    const workTime = await this.findOneByOrFail({ id });

    if (workTime.isShared) {
      throw new UnauthorizedException(
        'Um estabelecimento possui esse horário.\n Não foi possível atualizar',
      );
    }

    workTime.shift = dto.shift ?? workTime.shift;
    workTime.initHour = dto.initHour ?? workTime.initHour;
    workTime.endHour = dto.endHour ?? workTime.endHour;
    workTime.isDefault = isDefault;

    const created = await this.save(workTime);
    return this.findOneByOrFail({ id: created.id });
  }

  async updateShared(placeId: string, dto: UpdateWorkTimeDto, user: User) {
    if (!dto.id) {
      throw new BadRequestException('Campo ID é obrigatório');
    }

    const workTime = await this.findOneByOrFail({ id: dto.id, isShared: true });
    const place = workTime.places.find(item => item.id === placeId);

    if (!place) {
      throw new NotFoundException(
        'Estabelecimento não possui o horário de serviço',
      );
    }

    const isOwner = place.owners.some(item => item.id === user.id);

    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }

    if (dto.isDefault) {
      const defaultWorkTime = this.findDefaultFromPlace(place);

      if (defaultWorkTime) {
        await this.workTimeRepository.save({
          ...defaultWorkTime,
          isDefault: false,
        });
      }
    }

    workTime.shift = dto.shift ?? workTime.shift;
    workTime.initHour = dto.initHour ?? workTime.initHour;
    workTime.endHour = dto.endHour ?? workTime.endHour;
    workTime.isDefault = dto.isDefault ?? workTime.isDefault;

    const updated = await this.save(workTime);
    return this.findOneByOrFail({ id: updated.id });
  }

  async findOneBy(workTimeData: Partial<WorkTime>, relations = true) {
    const fields = relations ? full : essencial;
    return this.workTimeRepository.findOne({
      where: workTimeData,
      relations: fields,
    });
  }

  async findOneOwnedBy(
    user: User,
    workTimeData: Partial<WorkTime>,
    relations = true,
  ) {
    const fields = relations ? full : essencial;
    return this.workTimeRepository.findOne({
      where: { ...workTimeData, user: { id: user.id } },
      relations: fields,
    });
  }

  async findOneByOrFail(workTimeData: Partial<WorkTime>, relations = true) {
    const workTime = await this.findOneBy(workTimeData, relations);

    if (!workTime) {
      throw new NotFoundException('Esse horário de serviço não existe');
    }

    return workTime;
  }

  async findOneOwnedByOrFail(
    user: User,
    workTimeData: Partial<WorkTime>,
    relations = true,
  ) {
    const workTime = await this.findOneOwnedBy(user, workTimeData, relations);

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

  async remove(id: string) {
    const workTime = await this.findOneByOrFail({ id });

    if (workTime.isDefault || workTime.isShared) {
      throw new UnauthorizedException(
        'Esse horário de serviço pertence a algum estabelecimento',
      );
    }

    await this.workTimeRepository.delete({ id });
    return workTime;
  }

  async removeShared(placeId: string, id: string, user: User) {
    const workTime = await this.findOneByOrFail({ id, isShared: true });
    const place = workTime.places.find(item => item.id === placeId);

    if (!place) {
      throw new NotFoundException(
        'Estabelecimento não possui o horário de serviço',
      );
    }

    const isOwner = place.owners.some(item => item.id === user.id);

    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }

    if (workTime.isDefault) {
      throw new UnauthorizedException(
        'Esse horário de serviço é o padrão em algum estabelecimento',
      );
    }

    if (place.workTimes.length <= 1) {
      throw new UnauthorizedException(
        `O estabelecimento ${place.businessName} possui apenas esse\nHorário de serviço`,
      );
    }

    await this.workTimeRepository.delete({ id });
    return workTime;
  }

  async save(workTimeData: Partial<WorkTime>) {
    return await this.workTimeRepository.save(workTimeData);
  }
}
