import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherEntity } from './entities/voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherEntity])],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
