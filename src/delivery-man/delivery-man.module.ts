import { Module } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { DeliveryManController } from './delivery-man.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryManEntity]), CommonModule],
  controllers: [DeliveryManController],
  providers: [DeliveryManService],
  exports: [DeliveryManService],
})
export class DeliveryManModule {}
