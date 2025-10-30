import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { UserModule } from 'src/user/user.module';
import { CustomerModule } from 'src/customer/customer.module';
import { AddressModule } from 'src/address/address.module';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodService } from './services/payment-method.service';
import { TipModule } from 'src/tip/tip.module';
import { PlaceModule } from 'src/place/place.module';
import { WorkTimeModule } from 'src/work-time/work-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, PaymentMethod]),
    UserModule,
    CustomerModule,
    AddressModule,
    TipModule,
    PlaceModule,
    WorkTimeModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService, PaymentMethodService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
