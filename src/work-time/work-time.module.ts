import { Module } from '@nestjs/common';
import { WorkTimeService } from './work-time.service';
import { WorkTimeController } from './work-time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTime } from './entities/work-time.entity';
import { IntervalTime } from './entities/interval-time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkTime, IntervalTime])],
  controllers: [WorkTimeController],
  providers: [WorkTimeService],
  exports: [WorkTimeService],
})
export class WorkTimeModule {}
