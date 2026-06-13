import { Module } from '@nestjs/common';
import { WorkTimeService } from './services/work-time.service';
import { WorkTimeController } from './controllers/work-time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTime } from './entities/work-time.entity';
import { IntervalTime } from './entities/interval-time.entity';
import { IntervalTimeService } from './services/interval-time.service';
import { IntervalTimeController } from './controllers/interval-time.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkTime, IntervalTime])],
  controllers: [WorkTimeController, IntervalTimeController],
  providers: [WorkTimeService, IntervalTimeService],
  exports: [WorkTimeService, IntervalTimeService],
})
export class WorkTimeModule {}
