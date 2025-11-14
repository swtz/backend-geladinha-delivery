import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { SocialMedias } from './entities/social-medias.entity';
import { AddressModule } from 'src/address/address.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';
import { UserModule } from 'src/user/user.module';
import { WorkTimeDateService } from './services/work-time-date.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, SocialMedias]),
    AddressModule,
    WorkTimeModule,
    UserModule,
  ],
  controllers: [PlaceController],
  providers: [PlaceService, WorkTimeDateService],
  exports: [PlaceService, WorkTimeDateService],
})
export class PlaceModule {}
