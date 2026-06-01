import { Controller } from '@nestjs/common';
import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../customer.service';

@Controller('customer-address')
export class CustomerAddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
  ) {}
}
