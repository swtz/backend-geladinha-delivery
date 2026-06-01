import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { AddressModule } from 'src/address/address.module';
import { CustomerAddressController } from './controllers/customer-address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AddressModule],
  controllers: [CustomerController, CustomerAddressController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
