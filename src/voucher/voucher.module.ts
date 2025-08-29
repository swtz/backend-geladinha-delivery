import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherController } from './voucher.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), UserModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
