import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { WorkTime } from './entities/work-time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place, WorkTime])],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
