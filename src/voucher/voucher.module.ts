import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';

@Module({
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
