import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payout]), DeliveryModule, UserModule],
  controllers: [PayoutController],
  providers: [PayoutService],
})
export class PayoutModule {}
