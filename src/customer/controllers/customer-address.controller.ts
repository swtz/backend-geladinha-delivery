import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { ResponseCustomerDto } from '../dto/response-customer.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerAddressService } from '../services/customer-address.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerFieldsValidationService } from '../services/customer-fields-validation.service';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Controller('customer')
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
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.customerFieldsValidationService.validateUniqueFields(dto);
    const customer = await this.customerService.update(dto, id);
    return new ResponseCustomerDto(customer);
  }

  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    const parsedCustomers = customers.map(
      customer => new ResponseCustomerDto(customer),
    );
    return parsedCustomers;
  }

  @Get('find')
  async findOne(
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('nickname') nickname: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,

    // precisa-se validar email
    @Query('email') email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const customer = await this.customerService.findOneByOrFail({
      nickname,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    });

    return new ResponseCustomerDto(customer);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.remove(id);
    return new ResponseCustomerDto(customer);
  }

  @Post(':id/address')
  async addAddress(
    @Body() dto: CreateAddressDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customerAddressService.addAddress(dto, id);
    return new ResponseCustomerDto(customer);
  }

  @Delete('address/:id')
  async removeAddress(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.customerAddressService.removeAddress(id);
    return new ResponseAddressDto(address);
  }
}
