import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherController } from './voucher.controller';
import { UserModule } from 'src/user/user.module';
import { PlaceModule } from 'src/place/place.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]),
    UserModule,
    PlaceModule,
    WorkTimeModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService, WorkTimeDateService],
  exports: [VoucherService],
})
export class VoucherModule {}
