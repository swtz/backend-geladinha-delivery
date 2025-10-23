import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMan, User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { PlaceModule } from 'src/place/place.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryMan]),
    CommonModule,
    PlaceModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
