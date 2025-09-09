import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { UserModule } from 'src/user/user.module';
import { CustomerModule } from 'src/customer/customer.module';
import { AddressModule } from 'src/address/address.module';
import { PaymentMethod } from './entities/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, PaymentMethod]),
    UserModule,
    CustomerModule,
    AddressModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
