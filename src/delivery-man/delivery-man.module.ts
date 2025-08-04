import { Module } from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { DeliveryManController } from './delivery-man.controller';
import { VoucherModule } from 'src/voucher/voucher.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryManEntity]), VoucherModule],
  controllers: [DeliveryManController],
  providers: [DeliveryManService],
})
export class DeliveryManModule {}
