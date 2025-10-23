import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { WorkTime } from './entities/work-time.entity';
import { SocialMedias } from './entities/social-medias.entity';
import { WorkTimeService } from './services/work-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, WorkTime, SocialMedias])],
  controllers: [PlaceController],
  providers: [PlaceService, WorkTimeService],
  exports: [PlaceService, WorkTimeService],
})
export class PlaceModule {}
