import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkTime } from '../entities/work-time.entity';
import { Repository } from 'typeorm';
import { CreateWorkTimeDto } from '../dto/work-time/create-work-time.dto';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class WorkTimeService {
  private readonly logger = new Logger(WorkTimeService.name);

  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}

  create(dto: CreateWorkTimeDto) {
    const workTime = {
      shift: dto.shift,
      initHour: dto.initHour,
      endHour: dto.endHour,
      isDefault: dto.isDefault,
    };

    return this.save(workTime);
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
    });
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
