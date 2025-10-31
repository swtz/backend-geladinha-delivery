import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateBadRequestException } from 'src/common/generate-exception';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { WorkTime } from './entities/work-time.entity';
import { CreateWorkTimeDto } from './dto/create-work-time.dto';
import { UpdateWorkTimeDto } from './dto/update-work-time.dto';
import { User } from 'src/user/entities/user.entity';
import { NewWorkTimeForRest } from './types/new-work-time-for-rest';
import { FindAllParams } from './types/findAllParams';

@Injectable()
export class WorkTimeService {
  private readonly logger = new Logger(WorkTimeService.name);

  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  async findOneOrCreate(
    dto: CreateWorkTimeDto,
    isDefault = false,
    isShared = false,
  ) {
    const workTime = await this.findOneBy({ shift: dto.shift, isShared: true });

    const newWorkTime: NewWorkTimeForRest = {
      shift: dto.shift,
      initHour: dto.initHour,
      endHour: dto.endHour,
      isDefault,
      isShared,
    };

    if (!workTime) {
      const created = await this.save(newWorkTime);
      return this.findOneByOrFail({ id: created.id });
    }

    const exists = workTime.places.find(
      place => place.code === process.env.DEFAULT_PLACE_CODE,
    );

    if (!exists) {
      const created = await this.save(newWorkTime);
      return this.findOneByOrFail({ id: created.id });
    }

    return workTime;
  }

  async create(dto: CreateWorkTimeDto, place?: Place) {
    if (!place) {
      return this.findOneOrCreate(dto);
    }

    this.failIfShiftExistsInPlace(place, dto.shift);

    if (place.workTimes.length >= 5) {
      throw new BadRequestException(
        'Só é possível cadastrar 5 horários por estabelecimento',
      );
    }

    const defaultWorkTime = this.findDefaultFromPlace(place);
    const workTime = await this.findOneOrCreate(dto, dto.isDefault, true);

    workTime.places.push(place);

    if (dto.isDefault && defaultWorkTime) {
      await this.save({
        ...defaultWorkTime,
        isDefault: false,
      });
    }

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

  async findOneBy(workTimeData: Partial<WorkTime>) {
    return this.workTimeRepository.findOne({
      where: workTimeData,
      relations: {
        places: { workTimes: true, owners: true },
        user: true,
      },
    });
  }

  async findOneOwnedBy(user: User, workTimeData: Partial<WorkTime>) {
    return this.workTimeRepository.findOne({
      where: { ...workTimeData, user: { id: user.id } },
      relations: {
        places: { workTimes: true },
        user: true,
      },
    });
  }

  async findOneByOrFail(workTimeData: Partial<WorkTime>) {
    const workTime = await this.findOneBy(workTimeData);

    if (!workTime) {
      throw new NotFoundException('Esse horário de serviço não existe');
    }

    return workTime;
  }

  async findOneOwnedByOrFail(user: User, workTimeData: Partial<WorkTime>) {
    const workTime = await this.findOneOwnedBy(user, workTimeData);

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
      relations: { places: true, user: true },
    });
  }

  async findAllOwned(user: User) {
    return this.workTimeRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: { places: true, user: true },
    });
  }

  async remove(id: string) {
    const workTime = await this.findOneByOrFail({ id });

    if (workTime.isDefault) {
      throw new UnauthorizedException(
        'Esse horário de serviço é o padrão em algum estabelecimento',
      );
    }

    if (workTime.places.length > 0) {
      for (const place of workTime.places) {
        const hasWorkTime = place.workTimes.some(
          item => item.id === workTime.id,
        );

        if (hasWorkTime && place.workTimes.length === 1) {
          throw new UnauthorizedException(
            `O estabelecimento ${place.businessName} possui apenas esse\nHorário de serviço`,
          );
        }
      }
    }

    await this.workTimeRepository.delete({ id });
    return workTime;
  }

  async save(workTimeData: Partial<WorkTime>) {
    const http400 = generateBadRequestException(
      'Erro ao salvar o horário de serviço',
    );
    const created = await this.workTimeRepository
      .save(workTimeData)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
