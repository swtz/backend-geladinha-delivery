import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Customer } from '../entities/customer.entity';

export class ResponseCustomerDto {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly addresses: ResponseAddressDto[];

  constructor(customer: Customer) {
    this.id = customer.id;
    this.name = customer.name;
    this.phone = customer.phone;
    this.addresses = customer.addresses.map(address => {
      return new ResponseAddressDto(address);
    });
  }
}
