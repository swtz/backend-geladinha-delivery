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

@Controller('customer-address')
export class CustomerAddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
  ) {}

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
