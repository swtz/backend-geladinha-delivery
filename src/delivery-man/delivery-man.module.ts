import { Module } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { DeliveryManController } from './delivery-man.controller';

@Module({
  controllers: [DeliveryManController],
  providers: [DeliveryManService],
})
export class DeliveryManModule {}
