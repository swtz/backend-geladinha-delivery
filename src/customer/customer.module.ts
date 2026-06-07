import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { AddressModule } from 'src/address/address.module';
import { CustomerAddressController } from './controllers/customer-address.controller';
import { CustomerAddressService } from './services/customer-address.service';
import { CustomerFieldsValidationService } from './services/customer-fields-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AddressModule],
  controllers: [CustomerAddressController],
  providers: [
    CustomerService,
    CustomerAddressService,
    CustomerFieldsValidationService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
