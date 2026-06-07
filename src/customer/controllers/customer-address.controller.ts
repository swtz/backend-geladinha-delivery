import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { ResponseCustomerDto } from '../dto/response-customer.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { CustomerAddressService } from '../services/customer-address.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerFieldsValidationService } from '../services/customer-fields-validation.service';

@Controller('customer-address')
export class CustomerAddressController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerAddressService: CustomerAddressService,
    private readonly customerFieldsValidationService: CustomerFieldsValidationService,
  ) {}

  @Post()
  async create(
    @Body('customer') customerDto: CreateCustomerDto,
    @Body('address') addressDto: CreateAddressDto,
  ) {
    const customerWithAddress = await this.customerAddressService.create(
      customerDto,
      addressDto,
    );
    return new ResponseCustomerDto(customerWithAddress);
  }

  @Patch(':id')
  async update(
    @Body() dto: UpdateCustomerDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.customerFieldsValidationService.validateUniqueFields(dto);
    const customer = await this.customerService.update({ ...dto, phone }, id);
    return new ResponseCustomerDto(customer);
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

  // @Post(':id/address')
  // async addAddress(
  //   @Body() dto: CreateAddressDto,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const customer = await this.customerService.addAddress(dto, id);
  //   return new ResponseCustomerDto(customer);
  // }

  @Delete('address/:id')
  async removeAddress(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.customerService.removeAddress(id);
    return new ResponseAddressDto(address);
  }
}
