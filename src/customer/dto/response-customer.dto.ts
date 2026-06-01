import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Customer } from '../entities/customer.entity';

export class ResponseCustomerDto {
  readonly id: string;
  readonly name: string;
  readonly lastName?: string;
  readonly nickname?: string;
  readonly phone: string;
  readonly secondPhone?: string;
  readonly addresses: ResponseAddressDto[];

  constructor(customer: Customer) {
    this.id = customer.id;
    this.name = customer.name;
    this.lastName = customer.lastName;
    this.nickname = customer.nickname;
    this.phone = customer.phone;
    this.secondPhone = customer.secondPhone;
    this.addresses = customer.addresses.map(address => {
      return new ResponseAddressDto(address);
    });
  }
}
