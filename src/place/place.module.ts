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
import { WorkTimePlaceUserService } from './services/work-time-place-user.service';
import { WorkTimePlaceUserController } from './controllers/work-time-place-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, SocialMedias]),
    AddressModule,
    WorkTimeModule,
    UserModule,
  ],
  controllers: [PlaceController, WorkTimePlaceUserController],
  providers: [PlaceService, WorkTimeDateService, WorkTimePlaceUserService],
  exports: [PlaceService, WorkTimeDateService],
})
export class PlaceModule {}
