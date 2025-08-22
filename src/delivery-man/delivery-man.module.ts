import { Module } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { DeliveryManController } from './delivery-man.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMan } from './entities/delivery-man.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryMan]), CommonModule],
  controllers: [DeliveryManController],
  providers: [DeliveryManService],
  exports: [DeliveryManService],
})
export class DeliveryManModule {}
