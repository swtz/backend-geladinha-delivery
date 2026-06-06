import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../customer.service';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { ResponseCustomerDto } from '../dto/response-customer.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { CustomerAddressService } from '../services/customer-address.service';

@Controller('customer-address')
export class CustomerAddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
    private readonly customerAddressService: CustomerAddressService,
  ) {}

  @Post()
  async create(
    @Body() customerDto: CreateCustomerDto,
    @Body() addressDto: CreateAddressDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
  ) {
    const customerWithAddress = await this.customerAddressService.create(
      {
        ...customerDto,
        phone,
      },
      addressDto,
    );
    return new ResponseCustomerDto(customerWithAddress);
  }

  @Get(':id/address')
  async findAddressesByCustomer(@Param('id', ParseUUIDPipe) id: string) {
    const addresses = await this.customerService.findAddressesByCustomer({
      id,
    });
    const parsedAddresses = addresses.map(
      address => new ResponseAddressDto(address),
    );
    return parsedAddresses;
  }

  @Post(':id/address')
  async addAddress(
    @Body() dto: CreateAddressDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customerService.addAddress(dto, id);
    return new ResponseCustomerDto(customer);
  }

  @Delete('address/:id')
  async removeAddress(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.customerService.removeAddress(id);
    return new ResponseAddressDto(address);
  }
}
