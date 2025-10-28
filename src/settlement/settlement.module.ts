import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settlement } from './entities/settlement.entity';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { UserModule } from 'src/user/user.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';
import { PlaceModule } from 'src/place/place.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settlement]),
    DeliveryModule,
    VoucherModule,
    UserModule,
    WorkTimeModule,
    PlaceModule,
  ],
  controllers: [SettlementController],
  providers: [SettlementService],
})
export class SettlementModule {}
