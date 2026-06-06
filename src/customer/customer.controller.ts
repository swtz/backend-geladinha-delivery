import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { ResponseCustomerDto } from './dto/response-customer.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { validateFindOneParamsOrFail } from 'src/common/utils/validate-find-one-params-or-fail';
import { Address } from 'src/address/entities/address.entity';

@Roles(Role.Admin, Role.Operator)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo =
      !name && !phone && !id ? { name: 'unknown' } : { name, phone, id };
    const customer = await this.customerService.findOneByOrFail(qo);
    return new ResponseCustomerDto(customer);
  }

  @Patch(':id')
  async update(
    @Body() dto: UpdateCustomerDto,
    @Body('address') address: UpdateAddressDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const safeDto = validateFindOneParamsOrFail<Partial<Address>>(
      address,
      true,
    );
    const customer = await this.customerService.update(
      { ...dto, address: { ...safeDto }, phone },
      id,
    );
    return new ResponseCustomerDto(customer);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.remove(id);
    return new ResponseCustomerDto(customer);
  }
}
