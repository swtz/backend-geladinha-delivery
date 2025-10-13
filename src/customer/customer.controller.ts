import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { ResponseCustomerDto } from './dto/response-customer.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    const parsedCustomers = customers.map(
      customer => new ResponseCustomerDto(customer),
    );
    return parsedCustomers;
  }

  @UseGuards(JwtAuthGuard)
  @Get('find')
  async findOne(
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('phone', new DefaultValuePipe('')) phone: string | undefined,
  ) {
    phone = id ? undefined : phone;

    const customer = await this.customerService.findOneByOrFail({
      id,
      phone,
    });
    return new ResponseCustomerDto(customer);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateCustomerDto,
    @Body('address') address: CreateAddressDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
  ) {
    const customer = await this.customerService.create({
      ...dto,
      address,
      phone,
    });
    return new ResponseCustomerDto(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Body() dto: UpdateCustomerDto,
    @Body('address') address: UpdateAddressDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customerService.update(
      { ...dto, address, phone },
      id,
    );
    return new ResponseCustomerDto(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.remove(id);
    return new ResponseCustomerDto(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/address')
  async addAddress(
    @Body() dto: CreateAddressDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customerService.addAddress(dto, id);
    return new ResponseCustomerDto(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('address/:id')
  async removeAddress(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.customerService.removeAddress(id);
    return new ResponseAddressDto(address);
  }
}
