import { Module } from '@nestjs/common';
import { WorkTimeService } from './work-time.service';
import { WorkTimeController } from './work-time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTime } from './entities/work-time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkTime])],
  controllers: [WorkTimeController],
  providers: [WorkTimeService],
  exports: [WorkTimeService],
})
export class WorkTimeModule {}
