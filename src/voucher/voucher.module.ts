import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherController } from './voucher.controller';
import { UserModule } from 'src/user/user.module';
import { PlaceModule } from 'src/place/place.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]),
    UserModule,
    PlaceModule,
    WorkTimeModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
