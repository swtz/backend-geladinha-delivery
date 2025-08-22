import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { DeliveryManModule } from 'src/delivery-man/delivery-man.module';
import { VoucherController } from './voucher.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), DeliveryManModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
