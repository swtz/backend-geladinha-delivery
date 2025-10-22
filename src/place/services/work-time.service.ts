import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkTime } from '../entities/work-time.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkTimeService {
  constructor(
    @InjectRepository(WorkTime)
    private readonly workTimeRepository: Repository<WorkTime>,
  ) {}
}
