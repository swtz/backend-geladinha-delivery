import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settlement } from './entities/settlement.entity';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settlement]),
    DeliveryModule,
    VoucherModule,
    UserModule,
  ],
  controllers: [SettlementController],
  providers: [SettlementService],
})
export class SettlementModule {}
