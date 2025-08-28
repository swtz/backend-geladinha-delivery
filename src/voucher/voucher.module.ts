import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherController } from './voucher.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), UserModule, AuthModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
