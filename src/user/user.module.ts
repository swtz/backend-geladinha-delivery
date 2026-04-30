import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeliveryMan } from './entities/delivery-man.entity';
import { Motorcycle } from './entities/motorcycle.entity';
import { CommonModule } from 'src/common/common.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';
import { MotorcycleController } from './controllers/motorcycle.controller';
import { MotorcycleService } from './services/motorcycle.service';
import { DeliveryManMotorcycleService } from './services/delivery-man-motorcycle.service';
import { DeliveryManService } from './services/delivery-man.service';
import { DeliveryManMotorcycleController } from './controllers/delivery-man-motorcycle-controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryMan, Motorcycle]),
    CommonModule,
    WorkTimeModule,
  ],
  controllers: [
    UserController,
    MotorcycleController,
    DeliveryManMotorcycleController,
  ],
  providers: [
    UserService,
    MotorcycleService,
    DeliveryManService,
    DeliveryManMotorcycleService,
  ],
  exports: [UserService, DeliveryManService],
})
export class UserModule {}
