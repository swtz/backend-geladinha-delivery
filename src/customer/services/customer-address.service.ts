import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { transformToLowerCase } from 'src/common/utils/transform-to-lower-case';

export class CustomerAddressService {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
  ) {}

  async create(customerDto: CreateCustomerDto, addressDto: CreateAddressDto) {
    const fields = Object.keys(customerDto).filter(
      field => typeof customerDto[field] === 'string',
    );

    for (const field of fields) {
      transformToLowerCase(customerDto[field] as string);
    }

    const customer = await this.customerService.create(customerDto);
    const address = await this.addressService.create(addressDto);
    const created = await this.customerService.save({
      ...customer,
      addresses: [address],
    });

    return this.customerService.findOneByOrFail({ id: created.id });
  }
}
