import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMan, User } from './entities/user.entity';
import { Motorcycle } from './entities/motorcycle.entity';
import { CommonModule } from 'src/common/common.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryMan, Motorcycle]),
    CommonModule,
    WorkTimeModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
