import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './entities/delivery.entity';
import { DeliveryManModule } from 'src/delivery-man/delivery-man.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity]), DeliveryManModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
