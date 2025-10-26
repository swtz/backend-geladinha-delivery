import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkTime } from '../entities/work-time.entity';
import { Repository } from 'typeorm';
import { CreateWorkTimeDto } from '../dto/work-time/create-work-time.dto';
import { generateBadRequestException } from 'src/common/generate-exception';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { Place } from '../entities/place.entity';
import { UpdateWorkTimeDto } from '../dto/work-time/update-work-time.dto';

@Injectable()
export class WorkTimeService {
  private readonly logger = new Logger(WorkTimeService.name);

  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  async findOneOrCreate(shift: Shift, dto?: CreateWorkTimeDto) {
    const workTime = await this.findOneBy({ shift });

    if (dto) {
      if (
        [
          Shift.Custom,
          Shift.Default,
          Shift.WeekDay,
          Shift.Weekend,
          Shift.Holiday,
        ].includes(shift)
      ) {
        const created = await this.create(dto);
        return this.findOneByOrFail({ id: created.id });
      }

      if (!workTime) {
        if (dto.isDefault) {
          throw new BadRequestException(
            'Esse turno não pode ser usado como padrão',
          );
        }
        const created = await this.create({ ...dto, isDefault: false });
        return this.findOneByOrFail({ id: created.id });
      }
    }

    if (!workTime) {
      throw new BadRequestException(
        'Horário de serviço não encontrado.\nDados não enviados',
      );
    }

    return workTime;
  }

  create(dto: CreateWorkTimeDto) {
    const workTime = {
      shift: dto.shift,
      initHour: dto.initHour,
      endHour: dto.endHour,
      isDefault: dto.isDefault,
    };

    return this.save(workTime);
  }

  async update(id: string, dto: UpdateWorkTimeDto, place?: Place) {
    const workTime = await this.findOneByOrFail({ id });

    if (
      [Shift.Fist, Shift.Second, Shift.Third, Shift.Forth].includes(
        workTime.shift,
      )
    ) {
      throw new UnauthorizedException(
        'Turno compartilhado não pode ser atualizado',
      );
    }

    const newWorkTime = {
      shift: dto.shift ?? workTime.shift,
      initHour: dto.initHour ?? workTime.initHour,
      endHour: dto.endHour ?? workTime.endHour,
      isDefault: dto.isDefault ?? workTime.isDefault,
    };

    if (dto.isDefault && !place) {
      throw new BadRequestException('Informe um estabelecimento');
    }

    if (dto.isDefault && place) {
      const defaultWorkTime = this.findDefaultFromPlace(place);
      await this.workTimeRepository.save({
        ...defaultWorkTime,
        isDefault: false,
      });
    }

    const created = await this.save(newWorkTime);

    return this.findOneByOrFail({ id: created.id });
  }

  async findOneByOrFail(workTimeData: Partial<WorkTime>) {
    const workTime = await this.findOneBy(workTimeData);

    if (!workTime) {
      throw new NotFoundException('Esse horário de serviço não existe');
    }

    return workTime;
  }

  async findOneBy(workTimeData: Partial<WorkTime>) {
    return this.workTimeRepository.findOne({
      where: workTimeData,
      relations: {
        places: { workTimes: true },
      },
    });
  }

  findDefaultFromPlace(place: Place) {
    const { workTimes } = place;
    const workTime = workTimes.find(item => item.isDefault === true);
    return workTime;
  }

  failIfNotDefaultFromPlace(place: Place) {
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

  async remove(id: string) {
    const workTime = await this.findOneByOrFail({ id });
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
