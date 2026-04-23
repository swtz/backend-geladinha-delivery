import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMan, User } from './entities/user.entity';
import { Motorcycle } from './entities/motorcycle.entity';
import { CommonModule } from 'src/common/common.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';
import { MotorcycleController } from './controllers/motorcycle.controller';
import { MotorcycleService } from './services/motorcycle.service';
import { DeliveryManMotorcycleService } from './services/delivery-man-motorcycle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryMan, Motorcycle]),
    CommonModule,
    WorkTimeModule,
  ],
  controllers: [UserController, MotorcycleController],
  providers: [UserService, MotorcycleService, DeliveryManMotorcycleService],
  exports: [UserService],
})
export class UserModule {}
